import React from 'react';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export function KanbanView({ tasks, onEditTask, onUpdateTaskStatus }) {
  const columns = [
    { id: 'todo', label: 'Todo' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'review', label: 'Review' },
    { id: 'done', label: 'Done' }
  ];

  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  const getPriorityColor = (priority) => {
    if (priority >= 7) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (priority >= 4) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
    if (destination.droppableId !== source.droppableId) {
      if (onUpdateTaskStatus) {
        onUpdateTaskStatus(draggableId, destination.droppableId);
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="tp-kanban-board">
        {columns.map(col => (
          <div key={col.id} className="tp-kanban-column">
            <div className="tp-kanban-column-header">
              <span>{col.label}</span>
              <span className="text-xs px-2 py-1 bg-secondary rounded-full text-muted-foreground">
                {tasksByStatus[col.id].length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div 
                  className={`flex flex-col gap-3 flex-1 overflow-y-auto min-h-[150px] p-2 -mx-2 transition-colors ${snapshot.isDraggingOver ? 'bg-[var(--bg-base)] rounded-lg' : ''}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {tasksByStatus[col.id].map((task, index) => {
                    const taskId = task._id || task.id;
                    return (
                      <Draggable key={taskId} draggableId={taskId} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`tp-kanban-card ${snapshot.isDragging ? 'shadow-xl rotate-2 ring-1 ring-[var(--accent)] z-50' : ''}`}
                            onClick={() => onEditTask(taskId)}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-medium text-sm leading-tight text-foreground line-clamp-2">
                                {task.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2 mt-auto">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${getPriorityColor(task.priority)}`}>
                                P{task.priority || 1}
                              </span>
                              
                              {task.ai?.category && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-secondary text-secondary-foreground">
                                  {task.ai.category}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 border-t border-border pt-2">
                              {task.dueDate ? (
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>{format(new Date(task.dueDate), 'MMM d')}</span>
                                </div>
                              ) : (
                                <span className="opacity-0">-</span> // Placeholder to keep flex alignment
                              )}

                              {task.assignedTo && (
                                <div 
                                  className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium"
                                  title={task.assignedTo.name}
                                >
                                  {task.assignedTo.name?.charAt(0) || '?'}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                  
                  {tasksByStatus[col.id].length === 0 && !snapshot.isDraggingOver && (
                    <div className="p-4 text-center text-sm text-muted-foreground border-2 border-dashed border-border rounded-lg mt-2">
                      Drop tasks here
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
