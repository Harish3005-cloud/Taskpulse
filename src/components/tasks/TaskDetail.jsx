import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import TaskStatusBadge, { formatStatus } from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import Avatar from '../shared/Avatar';
import Breadcrumbs from '../shared/Breadcrumbs';

/**
 * TaskDetail — full-page task detail view matching Linear's issue detail.
 */
export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { getTaskById, activeWorkspace, getWorkspaceTasks } = useWorkspace();

  const task = getTaskById(taskId);

  if (!task) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--tp-text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Task not found</p>
          <button className="tp-btn tp-btn-secondary" onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  // Get task index for navigation
  const wsTasks = getWorkspaceTasks(task.workspaceId);
  const taskIndex = wsTasks.findIndex(t => t._id === task._id);

  const urgencyColors = {
    critical: 'var(--tp-priority-urgent)',
    high: 'var(--tp-priority-high)',
    medium: 'var(--tp-priority-medium)',
    low: 'var(--tp-priority-low)',
  };

  const categoryIcons = {
    bug: '🐛',
    feature: '✨',
    chore: '🔧',
    improvement: '📈',
  };

  return (
    <>
      {/* Top Bar with Breadcrumbs */}
      <div className="tp-topbar">
        <div className="tp-topbar-left">
          <Breadcrumbs items={[
            {
              label: activeWorkspace?.name || 'Workspace',
              to: `/dashboard/${activeWorkspace?.slug}/tasks`,
              icon: (
                <div className="tp-team-dot" style={{
                  background: 'linear-gradient(135deg, #ef4444, #f97316)',
                  width: 16, height: 16, borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 700, color: '#fff'
                }}>
                  {activeWorkspace?.name?.charAt(0)?.toUpperCase()}
                </div>
              )
            },
            { label: 'Tasks', to: `/dashboard/${activeWorkspace?.slug}/tasks` },
            { label: `${task.identifier} ${task.title}` },
          ]} />
          <button className="tp-icon-btn" title="Favorite" style={{ marginLeft: 4 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polygon points="7,1 9,5 13,5.5 10,8.5 10.8,12.5 7,10.5 3.2,12.5 4,8.5 1,5.5 5,5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
          </button>
          <button className="tp-icon-btn" title="More options">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="3" cy="7" r="1" fill="currentColor"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="11" cy="7" r="1" fill="currentColor"/></svg>
          </button>
        </div>
        <div className="tp-topbar-right">
          <div className="tp-task-nav">
            <span>{taskIndex + 1} / {wsTasks.length}</span>
            <button
              className="tp-icon-btn"
              disabled={taskIndex <= 0}
              onClick={() => taskIndex > 0 && navigate(`/dashboard/task/${wsTasks[taskIndex - 1]._id}`)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
            <button
              className="tp-icon-btn"
              disabled={taskIndex >= wsTasks.length - 1}
              onClick={() => taskIndex < wsTasks.length - 1 && navigate(`/dashboard/task/${wsTasks[taskIndex + 1]._id}`)}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Detail Body */}
      <div className="tp-task-detail">
        {/* Main Content */}
        <div className="tp-task-detail-main">
          <h1 className="tp-task-detail-title">{task.title}</h1>
          {task.description ? (
            <p className="tp-task-detail-desc">{task.description}</p>
          ) : (
            <p className="tp-task-detail-desc placeholder">Add a description...</p>
          )}

          {/* Activity / Comments section placeholder */}
          <div style={{ borderTop: '1px solid var(--tp-border-subtle)', paddingTop: 24, marginTop: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--tp-text)', margin: '0 0 16px 0' }}>Activity</h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <Avatar name={task.assignedTo?.name || 'U'} size={28} />
              <div style={{
                flex: 1,
                background: 'var(--tp-surface)',
                border: '1px solid var(--tp-border)',
                borderRadius: 'var(--tp-radius-md)',
                padding: '10px 12px',
                fontSize: 13,
                color: 'var(--tp-text-muted)',
                cursor: 'text',
              }}>
                Leave a comment...
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar — Properties */}
        <div className="tp-task-props">
          {/* Properties Section */}
          <div className="tp-task-props-section">
            <h4 className="tp-task-props-section-title">
              Properties
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </h4>

            <div className="tp-prop-row">
              <TaskStatusBadge status={task.status} />
              <span className="tp-prop-value">{formatStatus(task.status)}</span>
            </div>

            <div className="tp-prop-row">
              <span className="tp-prop-icon">···</span>
              <span className="tp-prop-value">
                <TaskPriorityBadge priority={task.priority} showLabel />
              </span>
            </div>

            <div className="tp-prop-row">
              {task.assignedTo ? (
                <>
                  <Avatar name={task.assignedTo.name} size={18} />
                  <span className="tp-prop-value">{task.assignedTo.name}</span>
                </>
              ) : (
                <>
                  <span className="tp-prop-icon">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/><path d="M2 12c0-2 2.5-3.5 5-3.5s5 1.5 5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  </span>
                  <span className="tp-prop-value" style={{ color: 'var(--tp-text-muted)' }}>Assign</span>
                </>
              )}
            </div>

            {task.dueDate && (
              <div className="tp-prop-row">
                <span className="tp-prop-icon">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="2.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/><path d="M1.5 5.5h11M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </span>
                <span className="tp-prop-value">
                  {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>

          {/* Labels Section */}
          <div className="tp-task-props-section">
            <h4 className="tp-task-props-section-title">
              Labels
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
            </h4>
            <div className="tp-prop-row" style={{ color: 'var(--tp-text-muted)' }}>
              <span className="tp-prop-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l6 6-6 6-6-6z" stroke="currentColor" strokeWidth="1.2"/></svg>
              </span>
              Add label
            </div>
          </div>

          {/* AI Score Card */}
          {task.ai && (
            <div className="tp-task-props-section">
              <h4 className="tp-task-props-section-title" style={{ color: 'var(--tp-ai)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1l1.5 3 3 .5-2 2.5.5 3L6 8.5 3 10l.5-3L1.5 4.5l3-.5L6 1z" fill="currentColor"/></svg>
                  AI Analysis
                </span>
              </h4>
              <div className="tp-ai-score-card">
                <div className="tp-ai-score-header">
                  <span className="tp-ai-score-label">AI Priority Score</span>
                  <span className="tp-ai-score-badge">{task.ai.priority}/10</span>
                </div>
                <div className="tp-ai-score-row">
                  <span className="tp-ai-score-row-label">Urgency</span>
                  <span className="tp-ai-score-row-value" style={{ color: urgencyColors[task.ai.urgency] || 'var(--tp-text-secondary)' }}>
                    {task.ai.urgency?.charAt(0).toUpperCase() + task.ai.urgency?.slice(1)}
                  </span>
                </div>
                <div className="tp-ai-score-row">
                  <span className="tp-ai-score-row-label">Category</span>
                  <span className="tp-ai-score-row-value">
                    {categoryIcons[task.ai.category] || '📋'} {task.ai.category?.charAt(0).toUpperCase() + task.ai.category?.slice(1)}
                  </span>
                </div>
                {task.ai.reasoning && (
                  <div className="tp-ai-reasoning">
                    "{task.ai.reasoning}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
