import { useQuery, useZero } from "@rocicorp/zero/react";
import { useCallback } from "react";
import KanbanBoard, {
  AddTaskRequest,
  DeleteTaskRequest,
  MoveTaskRequest,
} from "../components/KanbanBoard";
import { Schema } from "./schema";
import { Mutators } from "./mutators";

export default function Board() {
  const z = useZero<Schema, Mutators>();

  const [columns] = useQuery(
    z.query.column
      .related("tasks", (item) => item.orderBy("order", "asc"))
      .orderBy("order", "asc")
  );

  const handleAddTask = useCallback(
    (req: AddTaskRequest) => z.mutate.item.create(req),
    [z]
  );

  const handleRemoveTask = useCallback(
    (req: DeleteTaskRequest) => z.mutate.item.delete(req),
    [z]
  );

  const handleMoveTask = useCallback(
    (req: MoveTaskRequest) => z.mutate.item.move(req),

    [z]
  );

  return (
    <KanbanBoard
      columns={columns}
      onAddTask={handleAddTask}
      onRemoveTask={handleRemoveTask}
      onMoveTask={handleMoveTask}
      project="zero"
    />
  );
}
