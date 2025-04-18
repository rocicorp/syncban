import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DragUpdate,
} from "@hello-pangea/dnd";
import { nanoid } from "nanoid";
import { DeepReadonly } from "node_modules/@rocicorp/zero/out/shared/src/json";
import { must } from "~/utils/assert";
import React from "react"; // Ensure React is imported

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

export type AddTaskRequest = {
  id: string;
  title: string;
  creatorID: string;
  columnID: string;
};

export type MoveTaskRequest = {
  taskID: string;
  columnID: string;
  index: number;
};

export type DeleteTaskRequest = {
  id: string;
};

export default function KanbanBoard({
  columns,
  onAddTask,
  onRemoveTask,
  onMoveTask,
  project = "",
}: {
  columns: DeepReadonly<Column[]>;
  onAddTask: (task: AddTaskRequest) => void;
  onRemoveTask: (task: DeleteTaskRequest) => void;
  onMoveTask: (task: MoveTaskRequest) => void;
  project?: string;
}) {
  // Add dragDestination state and handler
  const [dragDestination, setDragDestination] = React.useState<string | null>(
    null
  );

  const handleDragUpdate = (update: DragUpdate) => {
    setDragDestination(
      update.destination ? update.destination.droppableId : null
    );
  };

  // Define a mapping from column (droppable) IDs to colors.
  const columnColorMapping: { [key: string]: string } = columns.reduce(
    (acc, col) => {
      const normalizedName = col.name.toLowerCase().replace(" ", "");
      let color = "";
      if (normalizedName === "todo") {
        color = "var(--color-yellow)";
      } else if (normalizedName === "inprogress") {
        color = "var(--color-pink)";
      } else if (normalizedName === "done") {
        color = "var(--color-green)";
      }
      acc[col.id] = color;
      return acc;
    },
    {} as { [key: string]: string }
  );

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    onMoveTask({
      taskID: result.draggableId,
      columnID: destination.droppableId,
      index: destination.index,
    });
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    columnID: string
  ) => {
    if (e.key === "Enter") {
      const input = e.target as HTMLInputElement;
      onAddTask({
        id: nanoid(),
        title: input.value,
        columnID,
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
      <h1 className={`app-title ${project ? `project-${project}` : ""}`}></h1>

      <div className="mobile-rotate">
        <p className="mobile-rotate-message">
          Please rotate your device to landscape orientation.
        </p>
      </div>
      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragUpdate={handleDragUpdate}
      >
        <div className="kanban-board">
          {columns.map((column) => (
            <div
              className={`column ${column.name.toLowerCase().replace(" ", "")}`}
              key={column.id}
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
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    className={`column-scroll ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="task-list">
                      {column.tasks.map((task, index) => (
                        <Draggable
                          draggableId={task.id}
                          index={index}
                          key={task.id}
                        >
                          {(provided, snapshot) => {
                            const extraStyle =
                              snapshot.isDragging && dragDestination
                                ? {
                                    backgroundColor:
                                      columnColorMapping[dragDestination],
                                  }
                                : {};
                            return (
                              <div
                                className="task-card"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  ...extraStyle,
                                }}
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
                                    onRemoveTask({ id: task.id });
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
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
