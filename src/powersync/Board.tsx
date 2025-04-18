import { useQuery, usePowerSync } from "@powersync/react";
import KanbanBoard, {
  AddTaskRequest,
  DeleteTaskRequest,
} from "../components/KanbanBoard";
import { nanoid } from "nanoid";
import { generateKeyBetween } from "fractional-indexing";
import { must } from "~/utils/assert";

export function Board() {
  const db = usePowerSync();

  const { data: items } = useQuery(
    `SELECT * FROM item order by "order" asc`,
    []
  );
  console.log("items", items);
  const { data: columns } = useQuery(
    `SELECT * FROM column order by "order" asc`,
    []
  );

  const mapped = columns.map((column) => {
    const tasks = items
      .filter((item) => item.column_id === column.id)
      .map((row) => {
        const avatarId = Math.floor(Math.random() * 70) + 1;
        const avatarUrl = `https://i.pravatar.cc/40?img=${avatarId}`;
        return {
          ...row,
          columnID: row.column_id,
          creatorID: row.creator_id,
        };
      });
    return {
      ...column,
      tasks,
    };
  });

  const onAddTask = async (task: AddTaskRequest) => {
    const col = mapped.find((col) => col.id === task.columnID);
    if (!col) {
      throw new Error(`Column ${task.columnID} not found`);
    }

    const order = generateKeyBetween(
      col.tasks[col.tasks.length - 1]?.order ?? null,
      null
    );

    await db.execute(
      'INSERT INTO item (id, column_id, creator_id, title, body, "order") VALUES (?, ?, ?, ?, ?, ?)',
      [nanoid(), task.columnID, "42", task.title, "", order]
    );
  };

  const onRemoveTask = async (task: DeleteTaskRequest) => {
    await db.execute("DELETE FROM item WHERE id = ?", [task.id]);
  };

  const onMoveTask = async (task: {
    taskID: string;
    columnID: string;
    index: number;
  }) => {
    const col = must(mapped.find((col) => col.id === task.columnID));
    const currentIndex = col.tasks.findIndex(
      (task: any) => task.id === task.taskID
    );

    let destIndex = task.index;
    if (currentIndex !== -1) {
      if (currentIndex < destIndex) {
        destIndex++;
      }
    }

    const order = generateKeyBetween(
      col.tasks[task.index - 1]?.order ?? null,
      col.tasks[task.index]?.order ?? null
    );

    await db.execute(
      'UPDATE item SET column_id = ?, "order" = ? WHERE id = ?',
      [task.columnID, order, task.taskID]
    );
  };

  return (
    <KanbanBoard
      columns={mapped}
      onAddTask={onAddTask}
      onRemoveTask={onRemoveTask}
      onMoveTask={onMoveTask}
      project="powersync"
    />
  );
}
