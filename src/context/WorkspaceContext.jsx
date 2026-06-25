import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/client';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  // Saved custom views (persisted to localStorage)
  const [savedViews, setSavedViews] = useState(() => {
    try {
      const stored = localStorage.getItem('tp-saved-views');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/workspaces');
      setWorkspaces(data.workspaces || []);
      // Auto-select first workspace if none active
      if (data.workspaces && data.workspaces.length > 0) {
        setActiveWorkspace(prev => {
          if (!prev || !data.workspaces.find(w => w._id === prev._id)) {
            return data.workspaces[0];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTasks = useCallback(async (workspaceId) => {
    if (!workspaceId) return;
    try {
      const { data } = await api.get(`/tasks?workspaceId=${workspaceId}`);
      setTasks(data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async (workspaceId) => {
    if (!workspaceId) return;
    try {
      const { data } = await api.get(`/notifications?workspaceId=${workspaceId}`);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  const markNotificationRead = useCallback(async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => n._id === notificationId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async (workspaceId) => {
    if (!workspaceId) return;
    try {
      await api.patch(`/notifications/read-all`, { workspaceId });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications read:', error);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (activeWorkspace?._id) {
      fetchTasks(activeWorkspace._id);
      fetchNotifications(activeWorkspace._id);
    }
  }, [activeWorkspace, fetchTasks, fetchNotifications]);

  const getWorkspaceTasks = useCallback((workspaceId) => {
    return tasks.filter(t => t.workspaceId === (workspaceId || activeWorkspace?._id));
  }, [tasks, activeWorkspace]);

  const getTaskById = useCallback((taskId) => {
    return tasks.find(t => t._id === taskId);
  }, [tasks]);

  const getTaskByIdentifier = useCallback((identifier) => {
    return tasks.find(t => t.identifier === identifier);
  }, [tasks]);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  // ── Saved Views ──
  const addView = useCallback((view) => {
    setSavedViews(prev => {
      const next = [...prev, view];
      localStorage.setItem('tp-saved-views', JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteView = useCallback((viewId) => {
    setSavedViews(prev => {
      const next = prev.filter(v => v.id !== viewId);
      localStorage.setItem('tp-saved-views', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspace,
      setActiveWorkspace,
      tasks,
      getWorkspaceTasks,
      getTaskById,
      getTaskByIdentifier,
      notifications,
      unreadCount,
      sidebarCollapsed,
      setSidebarCollapsed,
      toggleSidebar,
      fetchWorkspaces,
      fetchTasks,
      fetchNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      savedViews,
      addView,
      deleteView,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
