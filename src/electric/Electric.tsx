import { getShapeStream, useShape } from "@electric-sql/react";
import KanbanBoard, {
  AddTaskRequest,
  Column,
  Task,
} from "../components/KanbanBoard";
import { matchStream } from "./match-stream";
import { useMutation } from "@tanstack/react-query";

export default function Electric() {
  const columnShape = {
    url: new URL("/api/electric/shape", location.href).toString(),
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

  console.log({ columns, items });

  const addTask = async (task: AddTaskRequest) => {
    const itemsStream = getShapeStream<any>(itemShape);

    const findInsertPromise = matchStream({
      stream: itemsStream,
      operations: [`insert`],
      matchFn: ({ message }) => message.value.id === task.id,
    });

    const response = fetch("/api/electric/create-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(task),
    });

    return await Promise.all([findInsertPromise, response]);
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
    tasks.sort((a: any, b: any) => {
      return a.order.localeCompare(b.order);
    });
    return {
      ...column,
      tasks,
    } as unknown as Column;
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
