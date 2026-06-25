import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import FilterBar from '../shared/FilterBar';
import EmptyState from '../shared/EmptyState';

/**
 * MyTasks — shows tasks assigned to the current user.
 */
export default function MyTasks() {
  const { tasks } = useWorkspace();
  const { user } = useAuth();

  // Filter tasks assigned to the current user
  const myTasks = tasks.filter(t => t.assignee?._id === user?.id || t.assignee === user?.id);

  const tabs = [
    { key: 'assigned', label: 'Assigned' },
    { key: 'created', label: 'Created' },
    { key: 'subscribed', label: 'Subscribed' },
    { key: 'activity', label: 'Activity' },
  ];

  return (
    <>
      <div className="tp-topbar">
        <div className="tp-topbar-left">
          <span className="tp-topbar-title">My tasks</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--tp-border-subtle)' }}>
        <FilterBar tabs={tabs} activeTab="assigned" onChange={() => {}} />
        <div className="tp-sub-filter-actions" style={{ paddingRight: 16 }}>
          <button className="tp-icon-btn" title="Filter">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
          <button className="tp-icon-btn" title="Group by">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12M2 7h8M2 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
          <button className="tp-icon-btn" title="Display">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>
          </button>
        </div>
      </div>

      {myTasks.length === 0 ? (
        <EmptyState
          icon={<svg width="56" height="56" viewBox="0 0 56 56" fill="none"><circle cx="28" cy="28" r="20" stroke="currentColor" strokeWidth="1.5"/><path d="M20 28h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M18 22c4-6 16-6 20 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M18 34c4 6 16 6 20 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>}
          title="No tasks assigned to you"
          description="Tasks assigned to you will appear here."
          actionLabel="Create new task"
        />
      ) : (
        <div className="tp-task-list">
          {/* Would render task rows similar to TaskList */}
          {myTasks.map(task => (
            <div key={task._id} className="tp-task-row" style={{ paddingLeft: 16 }}>
              <span className="tp-task-row-id">{task.identifier}</span>
              <span className="tp-task-row-status">
                <span className={`tp-status-icon ${task.status}`} style={{ width: 14, height: 14 }} />
              </span>
              <span className="tp-task-row-title">{task.title}</span>
              <span className="tp-task-row-meta">
                {task.ai?.priority != null && (
                  <span className="tp-task-row-ai-score">AI {task.ai.priority}</span>
                )}
                <span className="tp-task-row-date">
                  {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
