import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { PanelLeft } from 'lucide-react';
import Sidebar from '../components/sidebar/Sidebar';
import CommandPalette from '../components/command-palette/CommandPalette';
import AskAIPanel from '../components/ai/AskAIPanel';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import CreateWorkspaceModal from '../components/sidebar/CreateWorkspaceModal';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import CreateViewModal from '../components/views/CreateViewModal';
import TaskDetailPanel from '../components/tasks/TaskDetailPanel';
import { useWorkspace } from '../context/WorkspaceContext';
import api from '../api/client';
import '../../src/styles/dashboard.css';
import '../../src/styles/command-palette.css';
import '../../src/styles/projects.css';


/**
 * DashboardLayout — the root shell for all dashboard views.
 * Renders: Sidebar (left) + Outlet (main) + CommandPalette overlay + AskAI floating panel.
 */
export default function DashboardLayout() {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateView, setShowCreateView] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { activeWorkspace, fetchTasks, fetchWorkspaces, loading, getTaskById, sidebarCollapsed, toggleSidebar } = useWorkspace();

  const handleCreateTask = async (taskData) => {
    if (!activeWorkspace) return;
    try {
      await api.post('/tasks', {
        ...taskData,
        workspaceId: activeWorkspace._id
      });
      // Refresh tasks
      fetchTasks(activeWorkspace._id);
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };

  const handleCreateWorkspace = async (workspaceData) => {
    try {
      await api.post('/workspaces', workspaceData);
      fetchWorkspaces();
      setShowCreateWorkspace(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
      alert('Failed to create workspace');
    }
  };

  const handleCreateProject = async (projectData) => {
    if (!activeWorkspace) return;
    try {
      await api.post('/projects', {
        ...projectData,
        workspaceId: activeWorkspace._id
      });
      setShowCreateProject(false);
      // Need to force sidebar refresh, which we can do by mutating activeWorkspace or just a global event
      // For now, reload page to keep it simple since we don't have a specific context for sidebar data
      window.location.reload();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    }
  };

  const handleCreateView = async (viewData) => {
    if (!activeWorkspace) return;
    try {
      await api.post('/views', {
        ...viewData,
        workspaceId: activeWorkspace._id
      });
      setShowCreateView(false);
      window.location.reload();
    } catch (error) {
      console.error('Failed to create view:', error);
      alert('Failed to create view');
    }
  };

  /**
   * Opens the task detail panel (edit drawer) from the command palette.
   * First tries to find the task in local state, otherwise could fetch from API.
   */
  const handleOpenTaskFromPalette = useCallback((taskId) => {
    const task = getTaskById(taskId);
    if (task) {
      setEditingTask(task);
    } else {
      // If task isn't in local state (different workspace), fetch it
      api.get(`/tasks/${taskId}`)
        .then(({ data }) => {
          setEditingTask(data.task || data);
        })
        .catch((err) => {
          console.error('Failed to fetch task:', err);
        });
    }
  }, [getTaskById]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--tp-bg)' }}>
        <div style={{ color: 'var(--tp-text-muted)', fontSize: 14 }}>Loading workspace...</div>
      </div>
    );
  }

  return (
    <div className="tp-dashboard-shell">
      {/* Sidebar */}
      <Sidebar 
        onCreateTask={() => setShowCreateTask(true)} 
        onCreateWorkspace={() => setShowCreateWorkspace(true)}
        onCreateProject={() => setShowCreateProject(true)}
        onCreateView={() => setShowCreateView(true)}
      />

      {/* Main Content — filled by child routes */}
      <div className="tp-main" style={{ position: 'relative' }}>
        {sidebarCollapsed && (
          <button 
            className="tp-sidebar-untoggle"
            onClick={toggleSidebar}
            title="Expand Sidebar"
          >
            <PanelLeft size={16} />
          </button>
        )}
        <Outlet context={{ onCreateTask: () => setShowCreateTask(true) }} />
      </div>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette onOpenTask={handleOpenTaskFromPalette} />

      {/* Ask AI Panel (bottom-right) */}
      <AskAIPanel />

      {/* Task Edit Drawer (opened from command palette search) */}
      {editingTask && (
        <TaskDetailPanel
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {/* Create Workspace Modal */}
      {showCreateWorkspace && (
        <CreateWorkspaceModal
          onClose={() => setShowCreateWorkspace(false)}
          onSubmit={handleCreateWorkspace}
        />
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onSubmit={handleCreateProject}
        />
      )}

      {/* Create View Modal */}
      {showCreateView && (
        <CreateViewModal
          onClose={() => setShowCreateView(false)}
          onSubmit={handleCreateView}
        />
      )}
    </div>
  );
}
