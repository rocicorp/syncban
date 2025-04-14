import { getShapeStream, useShape } from "@electric-sql/react";
import KanbanBoard, {
  AddTaskRequest,
  Column,
  Task,
} from "../components/KanbanBoard";
import { matchStream } from "./match-stream";
import { useMutation, useMutationState } from "@tanstack/react-query";

const shapeURL = import.meta.env.VITE_ELECTRIC_SHAPE_URL;
if (!shapeURL) {
  throw new Error("VITE_ELECTRIC_SHAPE_URL is not defined");
}

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
  const columns = useShape(columnShape);

  const items = useShape(itemShape);

  const addTask = async (task: AddTaskRequest) => {
    const abortController = new AbortController();
    const itemsStream = getShapeStream<any>(itemShape);

    const findInsertPromise = matchStream({
      stream: itemsStream,
      operations: [`insert`],
      matchFn: ({ message }) => message.value.id === task.id,
      signal: abortController.signal,
    }).then((res) => {
      console.log("Item inserted in stream", res);
      return res;
    });

    const response = fetch("/api/electric/create-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(task),
    })
      .then((res) => {
        console.log("HTTP Response received");
        return res;
      })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to create item");
        }
      });

    const responseError = response.then(
      // swallow resolution
      () => new Promise(() => {}),
      (err) => {
        abortController.abort();
        console.error("Error creating item", err);
        Promise.reject(err);
      }
    );

    return await Promise.race([
      responseError,
      Promise.all([findInsertPromise, response]),
    ]);
  };

  const onRemoveTask = async (taskId: string) => {
    const itemsStream = getShapeStream<any>(itemShape);

    const findDeletePromise = matchStream({
      stream: itemsStream,
      operations: [`delete`],
      matchFn: ({ message }) => message.value.id === taskId,
    });

    const response = fetch("/api/electric/delete-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: taskId,
      }),
    });

    return await Promise.all([findDeletePromise, response]);
  };

  const onMoveTask = async (task: {
    taskID: string;
    columnID: string;
    index: number;
  }) => {
    const itemsStream = getShapeStream<any>(itemShape);

    const findUpdatePromise = matchStream({
      stream: itemsStream,
      operations: [`update`],
      matchFn: ({ message }) => message.value.id === task.taskID,
    });

    const response = fetch("/api/electric/move-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        taskID: task.taskID,
        columnID: task.columnID,
        index: task.index,
      }),
    });

    return await Promise.all([findUpdatePromise, response]);
  };

  const { mutateAsync: addItemMut } = useMutation({
    scope: { id: `items` },
    mutationKey: [`add-item`],
    mutationFn: (task: AddTaskRequest) => addTask(task),
    onMutate: (task) => task,
  });

  const mapped = columns.data.map((column) => {
    const tasks = items.data
      .filter((item) => item.column_id === column.id)
      .map((row) => {
        return {
          ...row,
          columnID: row.column_id,
          creatorID: row.creator_id,
        };
      });
    return {
      ...column,
      tasks,
    } as unknown as Column;
  });

  const pending: AddTaskRequest[] = useMutationState({
    filters: { status: `pending` },
    select: (mutation) => mutation.state.context as AddTaskRequest,
  }).filter((item) => item !== undefined);

  // Merged the pending items into the mapped data
  pending.forEach((item) => {
    const col = mapped.find((col) => col.id === item.columnID);
    if (!col) {
      throw new Error(`Column ${item.columnID} not found`);
    }
    // According to https://github.com/electric-sql/electric/blob/main/examples/tanstack/src/Example.tsx#L93
    // we can end up with duplicates here momentarily, so we need to check that the new item isn't already
    // present.
    const existing = col.tasks.find((task) => task.id === item.id);
    if (existing) {
      return;
    }
    col.tasks.push(item);
  });

  // Finally we need to sort the tasks and columns by order.
  mapped.forEach((col) => {
    col.tasks.sort((a: any, b: any) => {
      return a.order.localeCompare(b.order);
    });
  });
  mapped.sort((a: any, b: any) => {
    return a.order.localeCompare(b.order);
  });

  return (
    <KanbanBoard
      columns={mapped}
      onAddTask={addItemMut}
      onRemoveTask={onRemoveTask}
      onMoveTask={onMoveTask}
    />
  );
}
