import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { generateKeyBetween } from "fractional-indexing";
import { nanoid } from "nanoid";
import { must } from "~/utils/assert";

export type Column = {
  id: string;
  name: string;
  order: string;
  tasks: Task[];
};

export type Task = {
  id: string;
  title: string;
  order: string;
  creatorID: string;
};

export type AddTaskRequest = Task & {
  columnID: string;
};

export type MoveTaskRequest = {
  taskID: string;
  columnID: string;
  order: string;
};

export default function KanbanBoard({
  columns,
  onAddTask,
  onRemoveTask,
  onMoveTask,
}: {
  columns: Column[];
  onAddTask: (task: AddTaskRequest) => void;
  onRemoveTask: (taskId: string) => void;
  onMoveTask: (task: MoveTaskRequest) => void;
}) {
  const handleDragEnd = (result: DropResult) => {
    debugger;
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const taskID = result.draggableId;
    let destColID = destination.droppableId;
    let destIndex = destination.index;

    const sourceCol = must(
      columns.find((col) => col.tasks.some((task) => task.id === taskID))
    );

    const destCol = must(columns.find((col) => col.id === destColID));

    if (sourceCol === destCol) {
      const currentIndex = sourceCol.tasks.findIndex(
        (task) => task.id === taskID
      );
      if (destIndex > currentIndex) {
        destIndex++;
      }
    }

    const order = generateKeyBetween(
      destCol.tasks[destIndex - 1]?.order ?? null,
      destCol.tasks[destIndex]?.order ?? null
    );

    onMoveTask({
      taskID: result.draggableId,
      columnID: destination.droppableId,
      order,
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    columnID: string
  ) => {
    if (e.key === "Enter") {
      const input = e.target as HTMLInputElement;
      const col = columns.find((col) => col.id === columnID);
      if (!col) {
        throw new Error(`Column ${columnID} not found`);
      }
      const order = generateKeyBetween(
        col.tasks[col.tasks.length - 1]?.order ?? null,
        null
      );
      onAddTask({
        columnID: columnID,
        title: input.value,
        id: nanoid(),
        order,
        creatorID: "42",
      });
      input.value = "";
    }
  };

  // generate avatarID by hashing creatorID
  const hashCode = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const getAvatarId = (creatorID: string) => {
    const hash = hashCode(creatorID);
    return (hash % 70) + 1; // 70 is the number of available avatars
  };

  const getAvatarUrl = (creatorID: string) => {
    const avatarId = getAvatarId(creatorID);
    return `https://i.pravatar.cc/40?img=${avatarId}`;
  };

  return (
    <div>
      <h1 className="app-title">Project Kanban Board</h1>
      <h2 className="subheader">
        Drag &amp; drop tasks to organize your workflow
      </h2>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-board">
          {columns.map((column) => (
            <Droppable droppableId={column.id} key={column.id}>
              {(provided, snapshot) => (
                <div
                  className={`column ${column.name} ${
                    snapshot.isDraggingOver ? "dragging-over" : ""
                  }`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <div className="column-header">
                    <h2>{column.name}</h2>
                    <span className="task-count">{column.tasks.length}</span>
                  </div>
                  <div className="new-task">
                    <input
                      type="text"
                      placeholder="Add task..."
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleKeyDown(e, column.id)
                      }
                    />
                  </div>
                  <div className="column-scroll">
                    <div className="task-list" style={{ minHeight: "48px" }}>
                      {column.tasks.map((task, index) => (
                        <Draggable
                          draggableId={task.id}
                          index={index}
                          key={task.id}
                        >
                          {(provided) => {
                            return (
                              <div
                                className="task-card"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <img
                                  className="avatar"
                                  src={getAvatarUrl(task.creatorID)}
                                  alt="Avatar"
                                />
                                <span>{task.title}</span>
                                <button
                                  className="remove-task"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveTask(task.id);
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            );
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
