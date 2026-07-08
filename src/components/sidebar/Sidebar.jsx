import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import Avatar from '../shared/Avatar';
import api from '../../api/client';
import { cn } from '../../lib/utils';
import {
  Inbox,
  CheckSquare,
  LayoutGrid,
  Columns,
  ListTodo,
  BarChart3,
  Sparkles,
  Activity,
  Settings,
  HelpCircle,
  Plus,
  ChevronDown,
  ChevronRight,
  PanelLeft,
  X,
  Search,
} from 'lucide-react';

const TEAM_COLORS = [
  'linear-gradient(135deg, #ef4444, #f97316)',
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #22c55e, #10b981)',
  'linear-gradient(135deg, #f59e0b, #eab308)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
];

export default function Sidebar({ onCreateTask, onCreateProject, onCreateView, isMobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeWorkspace, unreadCount, sidebarCollapsed, toggleSidebar } = useWorkspace();
  const { open: openCommandPalette } = useCommandPalette();
  const [expandedSections, setExpandedSections] = useState({ workspace: true, projects: true, views: true, try: true });

  const [projects, setProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);
  const [views, setViews] = useState([]);
  
  // Mobile only state
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useEffect(() => {
    if (!activeWorkspace) return;

    const fetchWorkspaceData = async () => {
      try {
        const [projRes, sharedProjRes, viewsRes] = await Promise.all([
          api.get(`/projects?workspaceId=${activeWorkspace._id}`),
          api.get(`/projects/shared`),
          api.get(`/views?workspaceId=${activeWorkspace._id}`)
        ]);
        setProjects(projRes.data.projects || []);
        setSharedProjects(sharedProjRes.data.projects || []);
        setViews(viewsRes.data.views || []);
      } catch (err) {
        console.error('Failed to fetch sidebar data', err);
      }
    };

    fetchWorkspaceData();
  }, [activeWorkspace]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };



  const handleMobileClick = () => {
    if (isMobile && setMobileOpen) setMobileOpen(false);
  };

  const activeIndicator = (
    <motion.div
      layoutId="sidebar-active-indicator"
      className="absolute inset-y-0 left-0 w-full rounded-md bg-tp-accent-soft"
      initial={false}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
    />
  );

  const sidebarContent = (
    <div className="flex h-full flex-col bg-tp-surface text-tp-foreground">
      {/* ── Header ──────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center justify-between px-3">
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <div className="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm font-semibold overflow-hidden">
            <Avatar name={activeWorkspace?.name || 'T'} size={24} />
            {!sidebarCollapsed && (
              <span className="truncate">{activeWorkspace?.name || 'TaskPulse'}</span>
            )}
          </div>
        </div>
        
        {!sidebarCollapsed && (
          <div className="flex shrink-0 items-center gap-0.5 text-tp-muted">
            <button 
              className="grid h-7 w-7 place-items-center rounded-md hover:bg-tp-bg hover:text-tp-foreground md:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X size={16} />
            </button>
            <button 
              className="hidden grid h-7 w-7 place-items-center rounded-md hover:bg-tp-bg hover:text-tp-foreground md:grid"
              title="Collapse Sidebar" 
              onClick={toggleSidebar}
            >
              <PanelLeft size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Scrollable Area ─────────────────── */}
      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-tp-border-strong scrollbar-track-transparent">
        {/* Primary Nav */}
        <nav className="flex flex-col gap-0.5">
          <NavLink to="/dashboard/command-center" onClick={handleMobileClick} className={({ isActive }) => cn(
            "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
            isActive ? "text-tp-accent font-medium" : "text-tp-muted hover:bg-tp-bg hover:text-tp-foreground",
            sidebarCollapsed && "justify-center px-0"
          )}>
            {({ isActive }) => (
              <>
                {isActive && activeIndicator}
                <LayoutGrid size={16} className="relative z-10 shrink-0" />
                {!sidebarCollapsed && <span className="relative z-10 truncate">Dashboard</span>}
              </>
            )}
          </NavLink>
          <NavLink to="/dashboard/inbox" onClick={handleMobileClick} className={({ isActive }) => cn(
            "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
            isActive ? "text-tp-accent font-medium" : "text-tp-muted hover:bg-tp-bg hover:text-tp-foreground",
            sidebarCollapsed && "justify-center px-0"
          )}>
            {({ isActive }) => (
              <>
                {isActive && activeIndicator}
                <Inbox size={16} className="relative z-10 shrink-0" />
                {!sidebarCollapsed && <span className="relative z-10 truncate">Inbox</span>}
                {!sidebarCollapsed && unreadCount > 0 && (
                  <span className="relative z-10 ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-tp-accent px-1.5 text-[10px] font-bold text-tp-on-accent">
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        </nav>

        {/* Workspace Nav */}
        {!sidebarCollapsed && (
          <div className="mt-6 flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-tp-subtle">
            Workspace
          </div>
        )}
        
        <nav className="mt-1 flex flex-col gap-0.5">
            <NavLink to={`/dashboard/${activeWorkspace?.slug || activeWorkspace?._id}/projects`} onClick={handleMobileClick} className={({ isActive }) => cn(
              "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
              isActive ? "text-tp-accent font-medium" : "text-tp-muted hover:text-tp-foreground hover:bg-tp-bg",
              sidebarCollapsed && "justify-center px-0"
            )}>
              {({ isActive }) => (
                <>
                  {isActive && activeIndicator}
                  <Columns size={16} className="relative z-10 shrink-0" />
                  {!sidebarCollapsed && <span className="relative z-10 truncate">Projects</span>}
                </>
              )}
            </NavLink>
            <NavLink to={`/dashboard/${activeWorkspace?.slug || activeWorkspace?._id}/tasks`} onClick={handleMobileClick} className={({ isActive }) => cn(
              "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
              isActive ? "text-tp-accent font-medium" : "text-tp-muted hover:text-tp-foreground hover:bg-tp-bg",
              sidebarCollapsed && "justify-center px-0"
            )}>
              {({ isActive }) => (
                <>
                  {isActive && activeIndicator}
                  <CheckSquare size={16} className="relative z-10 shrink-0" />
                  {!sidebarCollapsed && <span className="relative z-10 truncate">Tasks</span>}
                </>
              )}
            </NavLink>
            <NavLink to={`/dashboard/${activeWorkspace?.slug || activeWorkspace?._id}/views`} onClick={handleMobileClick} className={({ isActive }) => cn(
              "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
              isActive ? "text-tp-accent font-medium" : "text-tp-muted hover:text-tp-foreground hover:bg-tp-bg",
              sidebarCollapsed && "justify-center px-0"
            )}>
              {({ isActive }) => (
                <>
                  {isActive && activeIndicator}
                  <ListTodo size={16} className="relative z-10 shrink-0" />
                  {!sidebarCollapsed && <span className="relative z-10 truncate">Views</span>}
                </>
              )}
            </NavLink>
        </nav>

        {/* Shared Projects Nav */}
        {!sidebarCollapsed && sharedProjects.length > 0 && (
          <div className="mt-6 flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-tp-subtle">
            Shared Projects
          </div>
        )}
        
        {sharedProjects.length > 0 && (
          <nav className="mt-1 flex flex-col gap-0.5">
            {sharedProjects.map((project) => (
              <NavLink 
                key={project._id}
                to={`/dashboard/${project.workspaceId._id || project.workspaceId}/projects/${project._id}`} 
                onClick={handleMobileClick} 
                className={({ isActive }) => cn(
                  "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
                  isActive ? "text-tp-accent font-medium" : "text-tp-muted hover:text-tp-foreground hover:bg-tp-bg",
                  sidebarCollapsed && "justify-center px-0"
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && activeIndicator}
                    <div className="w-4 h-4 rounded-[4px] border border-tp-border-strong flex items-center justify-center shrink-0 text-[8px] font-bold uppercase overflow-hidden">
                      {project.name.charAt(0)}
                    </div>
                    {!sidebarCollapsed && <span className="relative z-10 truncate">{project.name}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        )}

        {/* Secondary Nav */}
        <nav className="mt-6 flex flex-col gap-0.5">
          <NavLink to="/dashboard/analytics" onClick={handleMobileClick} className={({ isActive }) => cn(
            "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
            isActive ? "text-tp-accent font-medium" : "text-tp-muted hover:bg-tp-bg hover:text-tp-foreground",
            sidebarCollapsed && "justify-center px-0"
          )}>
            {({ isActive }) => (
              <>
                {isActive && activeIndicator}
                <BarChart3 size={16} className="relative z-10 shrink-0" />
                {!sidebarCollapsed && <span className="relative z-10 truncate">Analytics</span>}
              </>
            )}
          </NavLink>
          <NavLink to="/dashboard/ai" onClick={handleMobileClick} className={({ isActive }) => cn(
            "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
            isActive ? "text-tp-accent font-medium" : "text-tp-muted hover:bg-tp-bg hover:text-tp-foreground",
            sidebarCollapsed && "justify-center px-0"
          )}>
            {({ isActive }) => (
              <>
                {isActive && activeIndicator}
                <Sparkles size={16} className="relative z-10 shrink-0" />
                {!sidebarCollapsed && <span className="relative z-10 truncate">AI Assistant</span>}
              </>
            )}
          </NavLink>
          <NavLink to="/dashboard/activity" onClick={handleMobileClick} className={({ isActive }) => cn(
            "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
            isActive ? "text-tp-accent font-medium" : "text-tp-muted hover:bg-tp-bg hover:text-tp-foreground",
            sidebarCollapsed && "justify-center px-0"
          )}>
            {({ isActive }) => (
              <>
                {isActive && activeIndicator}
                <Activity size={16} className="relative z-10 shrink-0" />
                {!sidebarCollapsed && <span className="relative z-10 truncate">Activity</span>}
              </>
            )}
          </NavLink>
        </nav>
      </div>

      {/* ── Footer ──────────────────────────── */}
      <div className="border-t border-tp-border p-3">
        <nav className="flex flex-col gap-0.5">
          <NavLink to="/dashboard/settings" onClick={handleMobileClick} className={({ isActive }) => cn(
            "relative flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors",
            isActive ? "text-tp-accent font-medium" : "text-tp-muted hover:bg-tp-bg hover:text-tp-foreground",
            sidebarCollapsed && "justify-center px-0"
          )}>
            {({ isActive }) => (
              <>
                {isActive && activeIndicator}
                <Settings size={16} className="relative z-10 shrink-0" />
                {!sidebarCollapsed && <span className="relative z-10 truncate">Settings</span>}
              </>
            )}
          </NavLink>
          <button className={cn(
            "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-tp-muted transition-colors hover:bg-tp-bg hover:text-tp-foreground",
            sidebarCollapsed && "justify-center px-0"
          )}>
            <HelpCircle size={16} className="shrink-0" />
            {!sidebarCollapsed && <span className="truncate">Help</span>}
          </button>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="hidden h-screen shrink-0 border-r border-tp-border bg-tp-surface md:block relative z-20"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-tp-border bg-tp-surface shadow-tp-xl md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
