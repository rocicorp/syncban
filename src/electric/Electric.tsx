import { useShape } from "@electric-sql/react";
import KanbanBoard, { AddTaskRequest, Column } from "../components/KanbanBoard";

export default function Electric() {
  const columns = useShape({
    url: new URL("/api/electric/shape", location.href).toString(),
    params: {
      table: "column",
    },
  });

  const items = useShape({
    url: new URL("/api/electric/shape", location.href).toString(),
    params: {
      table: "item",
    },
  });

  console.log({ items });

  const onAddTask = async (task: AddTaskRequest) => {
    try {
      const response = await fetch("/api/electric/create-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          column_id: task.columnId,
          title: task.title,
          body: "unused",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create item");
      }
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

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

  const onRemoveTask = async (taskId: string) => {
    try {
      const response = await fetch("/api/electric/delete-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: taskId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const onMoveTask = async (task: {
    taskID: string;
    columnID: string;
    index: number;
  }) => {
    try {
      const response = await fetch("/api/electric/move-item", {
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

      if (!response.ok) {
        throw new Error("Failed to move item");
      }
    } catch (error) {
      console.error("Error moving item:", error);
    }
  };

  return (
    <KanbanBoard
      columns={mapped}
      onAddTask={onAddTask}
      onRemoveTask={onRemoveTask}
      onMoveTask={onMoveTask}
    />
  );
}
