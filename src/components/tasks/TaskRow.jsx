import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import Avatar from '../shared/Avatar';

/**
 * TaskRow — single task row in the list, matching Linear's issue row.
 * Supports multi-select checkbox and detail panel preview.
 */
const TaskRow = memo(function TaskRow({ task, isSelected, onToggleSelect, onPreview, anySelected }) {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleClick = () => {
    if (onPreview) {
      onPreview(task);
    } else {
      navigate(`/dashboard/task/${task._id}`);
    }
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleSelect?.(task._id);
  };

  return (
    <div
      className={`tp-task-row ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      {/* Checkbox (visible on hover or when any item is selected) */}
      <span
        className={`tp-task-row-checkbox ${anySelected ? 'visible' : ''}`}
        onClick={handleCheckboxClick}
      >
        <input
          type="checkbox"
          checked={!!isSelected}
          onChange={() => {}}
          className="tp-checkbox"
          tabIndex={-1}
        />
      </span>

      {/* Context menu dots (visible on hover, hidden when checkbox showing) */}
      <span className={`tp-task-row-menu ${anySelected ? 'hidden' : ''}`}>···</span>

      {/* Task identifier */}
      <span className="tp-task-row-id">{task.identifier}</span>

      {/* Status icon */}
      <span className="tp-task-row-status">
        <TaskStatusBadge status={task.status} />
      </span>

      {/* Title */}
      <span className="tp-task-row-title">{task.title}</span>

      {/* Right-side metadata */}
      <span className="tp-task-row-meta">
        {/* Project */}
        {task.projectId && task.projectId.name && (
          <span className="tp-task-row-project" style={{ 
            fontSize: '12px', 
            color: 'var(--tp-muted)', 
            marginRight: '12px', 
            background: 'var(--tp-surface-hover)', 
            padding: '2px 8px', 
            borderRadius: '12px',
            whiteSpace: 'nowrap'
          }}>
            {task.projectId.name}
          </span>
        )}

        {/* Priority */}
        <span className="tp-task-row-priority">
          <TaskPriorityBadge priority={task.priority} />
        </span>

        {/* AI Score */}
        {task.ai?.priority != null && (
          <span className="tp-task-row-ai-score" title={`AI Score: ${task.ai.priority}/10`}>
            AI {task.ai.priority}
          </span>
        )}

        <div className="tp-task-row-cell tp-task-row-assignee">
        {task.assignedTo && (
          <Avatar name={task.assignedTo.name} size={20} />
        )}
      </div>

        {/* Date */}
        <span className="tp-task-row-date">{formatDate(task.createdAt)}</span>
      </span>
    </div>
  );
});

export default TaskRow;
