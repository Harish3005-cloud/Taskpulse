import { useParams, useOutletContext } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import TaskList from './TaskList';
import Breadcrumbs from '../shared/Breadcrumbs';

/**
 * TeamTasksView — wrapper that displays tasks for a specific team/workspace.
 */
export default function TeamTasksView() {
  const { teamSlug } = useParams();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const { onCreateTask } = useOutletContext();

  // Find workspace by slug
  const workspace = workspaces.find(ws => ws.slug === teamSlug) || activeWorkspace;

  // Set as active workspace if different
  if (workspace && workspace._id !== activeWorkspace?._id) {
    setActiveWorkspace(workspace);
  }

  const TEAM_COLORS = [
    'linear-gradient(135deg, #ef4444, #f97316)',
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #22c55e, #10b981)',
  ];

  const wsIndex = workspaces.findIndex(ws => ws._id === workspace?._id);

  return (
    <>
      {/* Top Bar with Breadcrumbs */}
      <div className="tp-topbar">
        <div className="tp-topbar-left">
          <Breadcrumbs items={[
            {
              label: workspace?.name || 'Workspace',
              to: `/dashboard/${teamSlug}/tasks`,
              icon: (
                <div style={{
                  width: 16, height: 16, borderRadius: 4,
                  background: TEAM_COLORS[wsIndex % TEAM_COLORS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 700, color: '#fff',
                }}>
                  {workspace?.name?.charAt(0)?.toUpperCase()}
                </div>
              ),
            },
            { label: 'Tasks' },
          ]} />
          <button className="tp-icon-btn" title="Favorite" style={{ marginLeft: 4 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polygon points="7,1 9,5 13,5.5 10,8.5 10.8,12.5 7,10.5 3.2,12.5 4,8.5 1,5.5 5,5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
          </button>
        </div>
        <div className="tp-topbar-right">
          <button className="tp-icon-btn" title="Notification">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6a4 4 0 118 0v3l1.5 2H2.5L4 9V6z" stroke="currentColor" strokeWidth="1.3"/><path d="M6 13h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>

      {/* Task List */}
      <TaskList workspaceId={workspace?._id} onCreateTask={onCreateTask} />
    </>
  );
}
