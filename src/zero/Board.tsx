import { useQuery, useZero } from "@rocicorp/zero/react";
import { useCallback } from "react";
import KanbanBoard, { AddTaskRequest } from "../components/KanbanBoard";
import { Schema } from "./schema";
import { nanoid } from "nanoid";
import { generateKeyBetween } from "fractional-indexing";
import { getOrCreateUserId } from "~/utils/user";

export default function Board() {
  const z = useZero<Schema>();
  const [columns] = useQuery(
    z.query.column
      .related("items", (item) => item.orderBy("order", "asc"))
      .orderBy("order", "asc")
  );

  const mapped = columns.map((column) => {
    return {
      ...column,
      tasks: column.items,
    };
  });

  const handleAddTask = useCallback(
    async (task: AddTaskRequest) => {
      const col = mapped.find((col) => col.id === task.columnID);
      if (!col) {
        throw new Error(`Column ${task.columnID} not found`);
      }

      const order = generateKeyBetween(
        col.tasks[col.tasks.length - 1]?.order ?? null,
        null
      );

      z.mutate.item.insert({
        id: nanoid(),
        columnID: task.columnID,
        title: task.title,
        body: "",
        order,
        creatorID: getOrCreateUserId(),
      });
    },
    [mapped, z]
  );

  const handleRemoveTask = useCallback(
    async (taskId: string) => {
      await z.mutate.item.delete({ id: taskId });
    },
    [z]
  );

  const handleMoveTask = useCallback(
    async (task: { taskID: string; columnID: string; index: number }) => {
      const col = mapped.find((col) => col.id === task.columnID);
      if (!col) {
        throw new Error(`Column ${task.columnID} not found`);
      }

      const prev = col.tasks.filter((t) => t.id !== task.taskID);

      const order = generateKeyBetween(
        prev[task.index - 1]?.order ?? null,
        prev[task.index]?.order ?? null
      );

      z.mutate.item.update({
        id: task.taskID,
        columnID: task.columnID,
        order,
      });
    },
    [mapped, z]
  );

  return (
    <KanbanBoard
      columns={mapped}
      onAddTask={handleAddTask}
      onRemoveTask={handleRemoveTask}
      onMoveTask={handleMoveTask}
    />
  );
}
