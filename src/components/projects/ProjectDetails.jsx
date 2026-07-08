import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { useProjectFilters } from '../../hooks/useProjectFilters';
import { KanbanView } from './KanbanView';
import { ListView } from './ListView';
import { LayoutGrid, List, ArrowLeft, Calendar, Users, Tag, CheckCircle2, Clock, AlertCircle, TrendingUp, Sparkles, Activity, Plus } from 'lucide-react';
import api from '../../api/client';
import Avatar from '../shared/Avatar';
import InviteMemberModal from './InviteMemberModal';
import { cn } from '../../lib/utils';
import { format, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';
import TaskDetailPanel from '../tasks/TaskDetailPanel';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function ProjectDetails() {
  const { teamSlug, projectId } = useParams();
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, setActiveWorkspace, triggerRefresh, refreshTrigger } = useWorkspace();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (teamSlug) {
      const ws = workspaces.find(w => w.slug === teamSlug || w._id === teamSlug);
      if (ws && ws._id !== activeWorkspace?._id) {
        setActiveWorkspace(ws);
      }
    }
  }, [teamSlug, workspaces, activeWorkspace, setActiveWorkspace]);

  const workspaceId = (activeWorkspace && (teamSlug === activeWorkspace.slug || teamSlug === activeWorkspace._id))
    ? activeWorkspace._id
    : (teamSlug || activeWorkspace?._id || localStorage.getItem('tp-workspace-id'));

  const fetchProjectDetails = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}?workspaceId=${workspaceId}`);
      setProject(data.project);
    } catch (err) {
      console.error('Failed to fetch project details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!workspaceId || !projectId) return;
    fetchProjectDetails();
  }, [workspaceId, projectId, refreshTrigger]);

  const { tasks, setTasks, fetchTasks, members } = useProjectFilters(workspaceId, projectId, null);

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? { ...t, status: newStatus } : t));
    try {
      await api.patch(`/tasks/${taskId}`, { workspaceId, status: newStatus });
      triggerRefresh(); // Global trigger
    } catch (err) {
      console.error('Failed to update task status', err);
      fetchTasks();
    }
  };

  const handleUpdateTaskDetails = (taskId, updates) => {
    setTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? { ...t, ...updates } : t));
    triggerRefresh(); // Global trigger
  };

  const handleEditTask = (taskId) => {
    const task = tasks.find(t => (t._id || t.id) === taskId);
    if (task) {
      setEditingTask(task);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`, { data: { workspaceId } });
        setTasks(prev => prev.filter(t => (t._id || t.id) !== taskId));
        triggerRefresh(); // Global trigger
      } catch (err) {
        console.error('Failed to delete task', err);
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'in-progress': return 'bg-tp-info-soft text-tp-info';
      case 'review': return 'bg-tp-warning-soft text-tp-warning';
      case 'done': return 'bg-tp-success-soft text-tp-success';
      case 'todo': 
      default: return 'bg-tp-border text-tp-muted';
    }
  };

  // Calculate timeline progress
  const timeline = useMemo(() => {
    if (!project?.startDate || !project?.targetDate) return null;
    const start = new Date(project.startDate);
    const end = new Date(project.targetDate);
    const today = new Date();
    const totalDays = differenceInDays(end, start) || 1;
    const daysPassed = Math.max(0, differenceInDays(today, start));
    const percent = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    return { percent, start, end };
  }, [project]);

  // Derive recent activity from tasks
  const recentActivity = useMemo(() => {
    return [...tasks]
      .filter(t => t.updatedAt || t.createdAt)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-tp-bg text-tp-muted">
        <div className="w-8 h-8 border-4 border-tp-border-strong border-t-tp-accent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return <div className="flex h-full items-center justify-center bg-tp-bg text-tp-muted">Project not found.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-tp-bg overflow-y-auto">
      <div className="max-w-[1400px] w-full mx-auto p-6 md:p-8">
        
        <button 
          onClick={() => navigate(`/dashboard/${teamSlug || activeWorkspace?.slug || activeWorkspace?._id || 'workspace'}/projects`)}
          className="flex items-center gap-2 text-sm text-tp-muted hover:text-tp-foreground mb-6 w-fit transition-colors group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </button>

        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
          
          {/* Hero Overview */}
          <motion.div variants={fadeUpItem} className="bg-tp-surface border border-tp-border rounded-2xl p-6 md:p-8 shadow-tp-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-tp-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row justify-between items-start gap-8 relative z-10">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider", getStatusColor(project.status))}>
                      {project.status || 'todo'}
                    </span>
                    {(project.labels || []).map((l, i) => (
                      <span key={i} className="px-2 py-1 rounded border border-tp-border bg-tp-bg text-[10px] font-medium text-tp-muted uppercase tracking-wider">
                        {l}
                      </span>
                    ))}
                  </div>

                  {/* AI Insight Badge Placeholder */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-tp-accent-soft rounded-lg border border-tp-accent/20">
                    <Sparkles size={14} className="text-tp-accent" />
                    <span className="text-xs font-bold text-tp-accent tracking-wide">Project on track for target date</span>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-tp-foreground mb-3">{project.name}</h1>
                <p className="text-tp-muted text-sm md:text-base leading-relaxed max-w-3xl">
                  {project.description || project.summary || 'No description provided.'}
                </p>
              </div>

              {/* Timeline Visualization */}
              {timeline && (
                <div className="w-full lg:w-80 shrink-0 bg-tp-bg border border-tp-border rounded-xl p-4">
                  <div className="flex items-center gap-2 text-tp-muted mb-4">
                    <Calendar size={16} />
                    <span className="text-sm font-semibold text-tp-foreground">Project Timeline</span>
                  </div>
                  <div className="relative pt-2 pb-6">
                    <div className="w-full bg-tp-border-strong h-1.5 rounded-full overflow-hidden">
                      <div className="bg-tp-accent h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${timeline.percent}%` }} />
                    </div>
                    {/* Tick marker for today */}
                    <div 
                      className="absolute top-1 bottom-4 w-0.5 bg-tp-foreground/20 rounded-full" 
                      style={{ left: `${timeline.percent}%` }} 
                    />
                    <div className="absolute top-5 left-0 -translate-x-1 text-[10px] font-medium text-tp-muted">
                      {format(timeline.start, "MMM d")}
                    </div>
                    <div className="absolute top-5 right-0 translate-x-1 text-[10px] font-medium text-tp-muted">
                      {format(timeline.end, "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 mt-8 pt-6 border-t border-tp-border relative z-10">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-tp-muted flex items-center gap-1.5">
                  <Users size={16} /> Team
                </span>
                <div className="flex -space-x-2 mr-2">
                  {(project.members || []).map((m, i) => (
                    <div key={i} className="relative group cursor-pointer">
                      <Avatar name={m.user?.name || m.user?.email || 'Unknown'} size={30} className="border-2 border-tp-surface" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50">
                        <div className="bg-tp-surface border border-tp-border text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          {m.user?.name || m.user?.email || 'Unknown'} <span className="text-tp-muted capitalize">({m.role})</span>
                        </div>
                        <div className="w-2 h-2 bg-tp-surface border-b border-r border-tp-border rotate-45 -mt-1.5" />
                      </div>
                    </div>
                  ))}
                  {(!project.members || project.members.length === 0) && (
                    <span className="text-sm text-tp-muted italic ml-2">Only you</span>
                  )}
                </div>
                {activeWorkspace && user && activeWorkspace.members?.some(m => {
                  const memberId = m.userId?._id || m.userId;
                  return memberId?.toString() === (user.id || user._id)?.toString() && m.role === 'owner';
                }) && (
                  <button 
                    onClick={() => setInviteModalOpen(true)}
                    className="flex items-center justify-center w-[30px] h-[30px] rounded-full border border-dashed border-tp-muted text-tp-muted hover:text-tp-foreground hover:border-tp-foreground transition-colors bg-tp-surface z-10"
                    title="Invite Members"
                  >
                    <Plus size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Metrics Row */}
          <motion.div variants={fadeUpItem} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-tp-surface border border-tp-border rounded-xl p-5 shadow-tp-sm">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-tp-muted flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-tp-accent" /> Progress
                </span>
                <span className="text-xl font-bold text-tp-foreground">{project.progress || 0}%</span>
              </div>
              <div className="w-full bg-tp-border-strong h-1.5 rounded-full overflow-hidden">
                <div className="bg-tp-accent h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${project.progress || 0}%` }}></div>
              </div>
            </div>

            <div className="bg-tp-surface border border-tp-border rounded-xl p-5 shadow-tp-sm flex items-center gap-4">
              <div className="p-3 bg-tp-bg border border-tp-border rounded-lg text-tp-foreground"><List size={20}/></div>
              <div>
                <div className="text-2xl font-bold text-tp-foreground">{project.totalTasks || 0}</div>
                <div className="text-xs font-medium text-tp-muted uppercase tracking-wider">Total Tasks</div>
              </div>
            </div>

            <div className="bg-tp-surface border border-tp-border rounded-xl p-5 shadow-tp-sm flex items-center gap-4">
              <div className="p-3 bg-tp-success-soft text-tp-success rounded-lg"><CheckCircle2 size={20}/></div>
              <div>
                <div className="text-2xl font-bold text-tp-foreground">{project.completedTasks || 0}</div>
                <div className="text-xs font-medium text-tp-muted uppercase tracking-wider">Completed</div>
              </div>
            </div>

            <div className="bg-tp-surface border border-tp-border rounded-xl p-5 shadow-tp-sm flex items-center gap-4">
              <div className="p-3 bg-tp-danger-soft text-tp-danger rounded-lg"><AlertCircle size={20}/></div>
              <div>
                <div className="text-2xl font-bold text-tp-foreground">{project.overdueTasks || 0}</div>
                <div className="text-xs font-medium text-tp-muted uppercase tracking-wider">Overdue</div>
              </div>
            </div>
          </motion.div>

          {/* Tasks Workspace & Activity */}
          <motion.div variants={fadeUpItem} className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Workspace */}
            <div className="xl:col-span-3 flex flex-col min-h-[600px] bg-tp-surface border border-tp-border rounded-2xl shadow-tp-sm overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b border-tp-border bg-tp-bg/50">
                <h2 className="text-lg font-semibold text-tp-foreground">Workspace</h2>
                <div className="flex items-center gap-1 bg-tp-bg p-1 rounded-md border border-tp-border">
                  <button 
                    className={cn(
                      "px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium rounded-sm transition-colors",
                      viewMode === 'kanban' ? "bg-tp-surface text-tp-foreground shadow-sm" : "text-tp-muted hover:text-tp-foreground"
                    )}
                    onClick={() => setViewMode('kanban')}
                  >
                    <LayoutGrid size={14} /> Board
                  </button>
                  <button 
                    className={cn(
                      "px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium rounded-sm transition-colors",
                      viewMode === 'list' ? "bg-tp-surface text-tp-foreground shadow-sm" : "text-tp-muted hover:text-tp-foreground"
                    )}
                    onClick={() => setViewMode('list')}
                  >
                    <List size={14} /> List
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden p-6 bg-tp-bg">
                {viewMode === 'kanban' ? (
                  <KanbanView 
                    tasks={tasks} 
                    onEditTask={handleEditTask} 
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                  />
                ) : (
                  <ListView 
                    tasks={tasks} 
                    onEditTask={handleEditTask} 
                    onDeleteTask={handleDeleteTask} 
                  />
                )}
              </div>
            </div>

            {/* Recent Activity Sidebar */}
            <div className="xl:col-span-1 flex flex-col bg-tp-surface border border-tp-border rounded-2xl shadow-tp-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-tp-border bg-tp-bg/50">
                <Activity size={16} className="text-tp-muted" />
                <h2 className="text-sm font-semibold text-tp-foreground uppercase tracking-wider">Recent Activity</h2>
              </div>
              <div className="p-5 space-y-6">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-tp-muted text-center py-8">No recent activity.</p>
                ) : (
                  recentActivity.map((task, i) => (
                    <div key={i} className="relative pl-6">
                      <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-tp-accent shadow-[0_0_8px_var(--tp-accent)]" />
                      {i !== recentActivity.length - 1 && (
                        <div className="absolute left-[3px] top-4 bottom-[-24px] w-0.5 bg-tp-border" />
                      )}
                      <p className="text-sm text-tp-foreground font-medium line-clamp-1">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-medium text-tp-muted uppercase tracking-wider">
                          Task Updated
                        </span>
                        <span className="text-[10px] text-tp-muted">&bull; {format(new Date(task.updatedAt || task.createdAt), 'MMM d, h:mm a')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </motion.div>

        </motion.div>
      </div>

      <InviteMemberModal 
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        projectId={projectId}
        workspaceId={workspaceId}
        onInviteSuccess={() => {
          fetchProjectDetails();
          // Optionally show a toast notification here
        }}
      />

      {editingTask && (
        <TaskDetailPanel 
          task={editingTask} 
          onClose={() => setEditingTask(null)} 
          members={members}
          onUpdateTask={handleUpdateTaskDetails}
        />
      )}
    </div>
  );
}
