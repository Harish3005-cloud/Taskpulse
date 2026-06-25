import { useNavigate } from 'react-router-dom';
import TaskStatusBadge, { formatStatus } from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import Avatar from '../shared/Avatar';

/**
 * TaskDetailPanel — slide-in panel (right side) showing task detail.
 * Like Linear's side-peek.
 */
export default function TaskDetailPanel({ task, onClose }) {
  const navigate = useNavigate();

  if (!task) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="tp-detail-panel-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="tp-detail-panel">
        {/* Panel Header */}
        <div className="tp-detail-panel-header">
          <span className="tp-detail-panel-id">{task.identifier}</span>
          <div className="tp-detail-panel-header-actions">
            <button
              className="tp-icon-btn"
              title="Open full page"
              onClick={() => navigate(`/dashboard/task/${task._id}`)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H3a1 1 0 00-1 1v2M9 2h2a1 1 0 011 1v2M5 12H3a1 1 0 01-1-1V9M9 12h2a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="tp-icon-btn" title="Close panel" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="tp-detail-panel-content">
          {/* Title */}
          <h2 className="tp-detail-panel-title">{task.title}</h2>

          {/* Description */}
          <p className="tp-detail-panel-desc">
            {task.description || 'No description provided.'}
          </p>

          {/* Properties */}
          <div className="tp-detail-panel-props">
            <div className="tp-detail-panel-prop">
              <span className="tp-detail-panel-prop-label">Status</span>
              <span className="tp-detail-panel-prop-value">
                <TaskStatusBadge status={task.status} />
                <span>{formatStatus(task.status)}</span>
              </span>
            </div>

            <div className="tp-detail-panel-prop">
              <span className="tp-detail-panel-prop-label">Priority</span>
              <span className="tp-detail-panel-prop-value">
                <TaskPriorityBadge priority={task.priority} />
                <span style={{ textTransform: 'capitalize' }}>{task.priority || 'None'}</span>
              </span>
            </div>

            <div className="tp-detail-panel-prop">
              <span className="tp-detail-panel-prop-label">Assignee</span>
              <span className="tp-detail-panel-prop-value">
                {task.assignedTo ? (
                  <>
                    <Avatar name={task.assignedTo.name} size={20} />
                    <span>{task.assignedTo.name}</span>
                  </>
                ) : (
                  <span style={{ color: 'var(--tp-text-muted)' }}>Unassigned</span>
                )}
              </span>
            </div>

            <div className="tp-detail-panel-prop">
              <span className="tp-detail-panel-prop-label">Created</span>
              <span className="tp-detail-panel-prop-value">
                <span>{formatDate(task.createdAt)}</span>
              </span>
            </div>

            {task.dueDate && (
              <div className="tp-detail-panel-prop">
                <span className="tp-detail-panel-prop-label">Due date</span>
                <span className="tp-detail-panel-prop-value">
                  <span>{formatDate(task.dueDate)}</span>
                </span>
              </div>
            )}
          </div>

          {/* AI Score Card */}
          {task.ai?.priority != null && (
            <div className="tp-detail-panel-ai">
              <div className="tp-detail-panel-ai-header">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9l-3 1.5.5-3.5L2 4.5l3.5-.5L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
                AI Priority Score
              </div>
              <div className="tp-detail-panel-ai-score">
                <div className="tp-detail-panel-ai-score-num">{task.ai.priority}</div>
                <div className="tp-detail-panel-ai-score-bar">
                  <div
                    className="tp-detail-panel-ai-score-fill"
                    style={{ width: `${task.ai.priority * 10}%` }}
                  />
                </div>
                <span className="tp-detail-panel-ai-score-label">/10</span>
              </div>
              {task.ai.reason && (
                <p className="tp-detail-panel-ai-reason">{task.ai.reason}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
