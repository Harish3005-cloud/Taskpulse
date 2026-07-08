import { useState, useCallback, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, Plus, Moon, Sun, PanelLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/sidebar/Sidebar';
import CommandPalette from '../components/command-palette/CommandPalette';
import AskAIPanel from '../components/ai/AskAIPanel';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import CreateProjectModal from '../components/projects/CreateProjectModal';
import CreateViewModal from '../components/views/CreateViewModal';
import TaskDetailPanel from '../components/tasks/TaskDetailPanel';
import { useWorkspace } from '../context/WorkspaceContext';
import { useCommandPalette } from '../context/CommandPaletteContext';
import api from '../api/client';
import '../../src/styles/command-palette.css';
import '../../src/styles/projects.css';
import { cn } from '../lib/utils';

export default function DashboardLayout() {
  const [showCreateTask, setShowCreateTask] = useState(false);

  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateView, setShowCreateView] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Theme state for toggle
  const [isDark, setIsDark] = useState(true);

  const { activeWorkspace, fetchTasks, fetchWorkspaces, loading, getTaskById, sidebarCollapsed, toggleSidebar, triggerRefresh } = useWorkspace();
  const { open: openCommandPalette } = useCommandPalette();
  const location = useLocation();

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme);
    document.documentElement.style.colorScheme = nextTheme ? 'dark' : 'light';
    localStorage.setItem('taskpulse-theme', nextTheme ? 'dark' : 'light');
  };

  const handleCreateTask = async (taskData) => {
    if (!activeWorkspace) return;
    try {
      const response = await api.post('/tasks', {
        ...taskData,
        workspaceId: activeWorkspace._id
      });
      fetchTasks(activeWorkspace._id);
      triggerRefresh();
      return response.data.task || response.data;
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };



  const handleCreateProject = async (projectData) => {
    if (!activeWorkspace) return;
    try {
      const response = await api.post('/projects', {
        ...projectData,
        workspaceId: activeWorkspace._id
      });
      setShowCreateProject(false);
      triggerRefresh();
      // window.location.reload(); // Removed to allow smooth dynamic updates
      return response.data.project || response.data;
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

  const handleOpenTaskFromPalette = useCallback((taskId) => {
    const task = getTaskById(taskId);
    if (task) {
      setEditingTask(task);
    } else {
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
      <div className="flex h-screen w-full overflow-hidden bg-tp-bg">
        {/* Sidebar Skeleton */}
        <div className="hidden md:flex w-64 flex-col border-r border-tp-border bg-tp-surface/50 p-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-6 h-6 rounded-md bg-tp-border animate-pulse" />
            <div className="w-24 h-4 rounded bg-tp-border animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="w-16 h-3 rounded bg-tp-border/50 animate-pulse mb-2" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-tp-border animate-pulse" />
                <div className="w-28 h-3 rounded bg-tp-border animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-14 border-b border-tp-border bg-tp-surface/50 px-4 flex items-center justify-between">
            <div className="w-32 h-4 rounded bg-tp-border animate-pulse" />
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-md bg-tp-border animate-pulse" />
              <div className="w-8 h-8 rounded-md bg-tp-border animate-pulse" />
            </div>
          </div>
          <div className="p-8">
            <div className="w-64 h-8 rounded-lg bg-tp-border animate-pulse mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 rounded-xl bg-tp-surface border border-tp-border animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Derive breadcrumbs based on route
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const wsName = activeWorkspace?.name || 'Workspace';
    
    if (path.includes('command-center')) return ['TaskPulse', 'Dashboard'];
    if (path.includes('inbox')) return ['TaskPulse', 'Inbox'];
    if (path.includes('analytics')) return ['TaskPulse', 'Analytics'];
    if (path.includes('ai')) return ['TaskPulse', 'AI Assistant'];
    if (path.includes('settings')) return ['TaskPulse', 'Settings'];
    if (path.includes('activity')) return ['TaskPulse', 'Activity'];
    
    if (path.includes('projects')) return [wsName, 'Projects'];
    if (path.includes('tasks')) return [wsName, 'Tasks'];
    if (path.includes('views')) return [wsName, 'Views'];
    
    return ['TaskPulse'];
  };
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-tp-bg text-tp-foreground">
      {/* Sidebar */}
      <Sidebar 
        onCreateTask={() => setShowCreateTask(true)} 
        onCreateProject={() => setShowCreateProject(true)}
        onCreateView={() => setShowCreateView(true)}
        isMobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-tp-border bg-tp-surface/50 px-4 backdrop-blur-md">
          {/* Left: Breadcrumbs & Toggles */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="grid h-8 w-8 place-items-center rounded-md text-tp-muted hover:bg-tp-bg hover:text-tp-foreground md:hidden"
            >
              <Menu size={18} />
            </button>
            {sidebarCollapsed && (
              <button 
                onClick={toggleSidebar}
                className="hidden grid h-8 w-8 place-items-center rounded-md text-tp-muted hover:bg-tp-bg hover:text-tp-foreground md:grid"
                title="Expand Sidebar"
              >
                <PanelLeft size={18} />
              </button>
            )}
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm font-medium">
              {breadcrumbs.map((crumb, idx) => (
                <div key={crumb} className="flex items-center gap-2">
                  <span className={cn(
                    "truncate",
                    idx === breadcrumbs.length - 1 ? "text-tp-foreground" : "text-tp-muted"
                  )}>
                    {crumb}
                  </span>
                  {idx < breadcrumbs.length - 1 && (
                    <span className="text-tp-subtle">/</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => openCommandPalette()}
              className="flex h-8 items-center gap-2 rounded-md border border-tp-border bg-tp-bg px-3 text-sm text-tp-muted transition-colors hover:border-tp-border-strong hover:text-tp-foreground"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden h-5 items-center gap-1 rounded bg-tp-surface px-1.5 font-mono text-[10px] sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            <button onClick={toggleTheme} className="grid h-8 w-8 place-items-center rounded-md text-tp-muted hover:bg-tp-bg hover:text-tp-foreground">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            
            <button className="grid h-8 w-8 place-items-center rounded-md text-tp-muted hover:bg-tp-bg hover:text-tp-foreground relative">
              <Bell size={16} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-tp-accent"></span>
            </button>

            <div className="mx-1 h-4 w-px bg-tp-border hidden sm:block" />

            <button 
              onClick={() => setShowCreateTask(true)}
              className="hidden h-8 items-center gap-1.5 rounded-md bg-tp-accent px-3 text-sm font-medium text-tp-accent-foreground shadow-tp-sm transition-colors hover:bg-tp-accent-hover sm:flex"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>
            <button 
              onClick={() => setShowCreateTask(true)}
              className="grid h-8 w-8 place-items-center rounded-md bg-tp-accent text-tp-accent-foreground shadow-tp-sm hover:bg-tp-accent-hover sm:hidden"
            >
              <Plus size={16} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-tp-bg relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="min-h-full"
            >
              <Outlet context={{ 
                onCreateTask: () => setShowCreateTask(true),
                onCreateProject: () => setShowCreateProject(true),
                onCreateView: () => setShowCreateView(true)
              }} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Overlays */}
      <CommandPalette onOpenTask={handleOpenTaskFromPalette} />
      <AskAIPanel />

      <AnimatePresence>
        {editingTask && (
          <TaskDetailPanel
            task={editingTask}
            onClose={() => setEditingTask(null)}
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      {showCreateTask && <CreateTaskModal onClose={() => setShowCreateTask(false)} onSubmit={handleCreateTask} />}
      {showCreateProject && <CreateProjectModal onClose={() => setShowCreateProject(false)} onSubmit={handleCreateProject} />}
      {showCreateView && <CreateViewModal onClose={() => setShowCreateView(false)} onSubmit={handleCreateView} />}
    </div>
  );
}
