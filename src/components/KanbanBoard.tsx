import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";

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
  avatarUrl: string;
};

export type AddTaskRequest = {
  columnId: string;
  title: string;
};

export type MoveTaskRequest = {
  taskID: string;
  columnID: string;
  index: number;
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
        columnId: columnID,
        title: input.value,
      });
      input.value = "";
    }
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
                                  src={task.avatarUrl}
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
