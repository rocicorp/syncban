import { getShapeStream, useShape } from "@electric-sql/react";
import { type Row } from "@electric-sql/client";
import KanbanBoard, {
  AddTaskRequest,
  Column,
  MoveTaskRequest,
  Task,
} from "../components/KanbanBoard";
import { MatchFunction, MatchOperation, matchStream } from "./match-stream";
import { useMutation, useMutationState } from "@tanstack/react-query";
import { must } from "~/utils/assert";
import { generateKeyBetween } from "fractional-indexing";
import { compareOrdered } from "~/utils/lex";

const shapeURL = import.meta.env.VITE_ELECTRIC_SHAPE_URL + "&cb=" + Date.now();
if (!shapeURL) {
  throw new Error("VITE_ELECTRIC_SHAPE_URL is not defined");
}

/**
 * This component adapts the shared Kanban component to the Electric sync
 * service and implements optimistic mutations per Electric's advice.
 *
 * The optimistic mutation code is adapted from:
 * https://github.com/electric-sql/electric/blob/main/examples/tanstack/src/Example.tsx#L94
 * but with some additional error handling.
 */
export default function Electric() {
  const columnShape = {
    // TODO: I could not figure out how to get tanstack to serve a streaming
    // response in order to proxy the shape stream. Thus I had to do this
    // insecurely for the demo.
    //
    // There is surely some way to add a custom handler at the Nitro level and
    // handle the request directly:
    // https://discord.com/channels/719702312431386674/1354923811291791371/1355228008776208405
    //
    // Probably the Nitro docs are the place to look. Anyway not important for
    // demo purposes.
    url: shapeURL,
    params: {
      table: "column",
    },
  };
  const itemShape = {
    ...columnShape,
    params: {
      table: "item",
    },
  };

  const columns = useShape<Row<any>>(columnShape).data;
  const items = useShape<Row<any>>(itemShape).data.map(
    ({ id, column_id, creator_id, title, order }) => {
      return {
        id,
        columnID: column_id,
        creatorID: creator_id,
        title,
        order,
      };
    }
  );

  // This helper function executes an HTTP mutation then waits for the
  // corresponding change to show up in the shape stream. This is not
  // a perfect implementation, but apparently this is all being redone
  // anyway: https://github.com/TanStack/optimistic.
  const fetchAndWaitForShape = async <T extends Row<unknown>>(
    url: string,
    body: any,
    matchOp: MatchOperation,
    matchFn: MatchFunction<T>
  ) => {
    const abortController = new AbortController();
    const itemsStream = getShapeStream<any>(itemShape);

    const findInsertPromise = matchStream({
      stream: itemsStream,
      operations: [matchOp],
      matchFn,
      signal: abortController.signal,
    }).then((res) => {
      console.log("Change found in stream", res);
      return res;
    });

    const response = fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    })
      .then((res) => {
        console.log("HTTP Response received");
        return res;
      })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("HTTP request failed");
        }
      });

    const responseError = response.then(
      // swallow resolution
      () => new Promise(() => {}),
      (err) => {
        abortController.abort();
        console.error("Error sending request", err);
        Promise.reject(err);
      }
    );

    // Wait for *either* an http error (in which case we should give up on
    // stream), *or* both the http result and the stream result.
    return await Promise.race([
      responseError,
      Promise.all([findInsertPromise, response]),
    ]);
  };

  const addTask = async (task: AddTaskRequest) => {
    await fetchAndWaitForShape(
      "/api/electric/create-item",
      task,
      "insert",
      ({ message }) => {
        return message.value.id === task.id;
      }
    );
  };

  const removeTask = async (taskId: string) => {
    await fetchAndWaitForShape(
      "/api/electric/delete-item",
      { id: taskId },
      "delete",
      ({ message }) => {
        return message.value.id === taskId;
      }
    );
  };

  const moveTask = async (req: MoveTaskRequest) => {
    await fetchAndWaitForShape(
      "/api/electric/move-item",
      req,
      "update",
      ({ message }) => {
        return message.value.id === req.taskID;
      }
    );
  };

  const { mutateAsync: addItemMut } = useMutation({
    scope: { id: `items` },
    mutationKey: [`add-item`],
    mutationFn: (task: AddTaskRequest) => addTask(task),
    onMutate: (task) => task,
  });

  const { mutateAsync: removeItemMut } = useMutation({
    scope: { id: `items` },
    mutationKey: [`delete-item`],
    mutationFn: (taskId: string) => removeTask(taskId),
    onMutate: (taskId) => taskId,
  });

  const { mutateAsync: moveItemMut } = useMutation({
    scope: { id: `items` },
    mutationKey: [`move-item`],
    mutationFn: (task: MoveTaskRequest) => moveTask(task),
    onMutate: (task) => task,
  });

  // Merged the pending add into the synced items
  const pendingAdds: AddTaskRequest[] = useMutationState({
    filters: { status: `pending`, mutationKey: ["add-item"] },
    select: (mutation) => mutation.state.context as AddTaskRequest,
  }).filter((item) => item !== undefined);

  pendingAdds.forEach((item) => {
    // Remove existing item if it exists.
    // According to https://github.com/electric-sql/electric/blob/main/examples/tanstack/src/Example.tsx#L93
    // we can end up with duplicates here momentarily, so we need to check that
    // the new item isn't already present.
    const existing = items.findIndex((task) => task.id === item.id);
    if (existing !== -1) {
      items.splice(existing, 1);
    }
    items.push(item);
  });

  // Merge the pending deletes into the synced items
  const pendingDeletes = useMutationState({
    filters: { status: `pending`, mutationKey: ["delete-item"] },
    select: (mutation) => mutation.state.context as string,
  }).filter((item) => item !== undefined);

  pendingDeletes.forEach((item) => {
    const existing = items.findIndex((task) => task.id === item);
    if (existing !== -1) {
      items.splice(existing, 1);
    }
  });

  // Merge the pending moves into the mapped data
  // TODO: Possibly this would be easier w/ electric to just represent as a put
  // of the whole data item, then could treat the same as add basically.
  const pendingMoves = useMutationState({
    filters: { status: `pending`, mutationKey: ["move-item"] },
    select: (mutation) => mutation.state.context as MoveTaskRequest,
  }).filter((item) => item !== undefined);
  pendingMoves.forEach((item) => {
    const destSiblings = items
      .filter((task) => task.columnID === item.columnID)
      .sort(compareOrdered);

    let destIndex = item.index;
    const currentIndex = destSiblings.findIndex(
      (task) => task.id === item.taskID
    );
    if (currentIndex !== -1) {
      if (currentIndex < destIndex) {
        destIndex++;
      }
    }

    const order = generateKeyBetween(
      destSiblings[destIndex - 1]?.order ?? null,
      destSiblings[destIndex]?.order ?? null
    );

    const existing = must(items.find((task) => task.id === item.taskID));
    existing.columnID = item.columnID;
    existing.order = order;
  });

  // Now map the data into the shape needed by UI.
  const mapped = columns.map((column) => {
    const tasks = items
      .filter((item) => item.columnID === column.id)
      .map((row) => {
        return {
          ...row,
          columnID: row.columnID,
          creatorID: row.creatorID,
        };
      })
      .sort(compareOrdered);
    return {
      ...column,
      tasks,
    } as unknown as Column;
  });
  mapped.sort(compareOrdered);

  return (
    <KanbanBoard
      columns={mapped}
      onAddTask={addItemMut}
      onRemoveTask={removeItemMut}
      onMoveTask={moveItemMut}
      project="electric"
    />
  );
}
