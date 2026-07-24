import React, { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useProjectCompatibility } from '../../hooks/useProjectCompatibility';
import { format, isBefore, startOfDay, endOfDay } from 'date-fns';
import InviteTeamModal from '../team/InviteTeamModal';
import { Sparkles, CalendarClock, AlertCircle, Calendar, Activity, CheckCircle2, ChevronRight, UserPlus, Plus, LayoutGrid } from 'lucide-react';
import { cn } from '../../lib/utils';
import Avatar from '../shared/Avatar';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function CommandCenter() {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const { activeWorkspace, tasks, loading } = useWorkspace();
  const { projects, loading: projectsLoading } = useProjectCompatibility();

  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const onCreateTask = outletContext?.onCreateTask;

  // Dynamic Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  }, []);

  // Derived Tasks for My Day
  const { overdue, dueToday, upcoming } = useMemo(() => {
    let overdueCount = 0;
    let dueTodayCount = 0;
    let upcomingCount = 0;

    tasks.forEach(task => {
      if (task.status === 'done') return;
      if (!task.dueDate) return;

      const date = new Date(task.dueDate);
      const todayStart = startOfDay(new Date());
      const todayEnd = endOfDay(new Date());
      
      if (isBefore(date, todayStart)) {
        overdueCount++;
      } else if (isBefore(date, todayEnd) && !isBefore(date, todayStart)) {
        dueTodayCount++;
      } else {
        upcomingCount++;
      }
    });
    return { overdue: overdueCount, dueToday: dueTodayCount, upcoming: upcomingCount };
  }, [tasks]);

  // Derived AI Focus
  const aiRecommendedTasks = useMemo(() => {
    return [...tasks]
      .filter(t => t.status !== 'done' && t.ai?.priority)
      .sort((a, b) => b.ai.priority - a.ai.priority)
      .slice(0, 3);
  }, [tasks]);

  // Derived Activity Feed
  const recentActivity = useMemo(() => {
    return [...tasks]
      .filter(t => t.updatedAt || t.createdAt)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);
  }, [tasks]);

  const getPriorityTag = (score) => {
    if (score >= 80) return { label: 'High', class: 'bg-tp-danger-soft text-tp-danger' };
    if (score >= 50) return { label: 'Medium', class: 'bg-tp-warning-soft text-tp-warning' };
    return { label: 'Low', class: 'bg-tp-accent-soft text-tp-accent' };
  };

  if (loading || projectsLoading) {
    return (
      <div className="flex-1 p-6 md:p-8 bg-tp-bg overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-end justify-between pb-6 border-b border-tp-border">
            <div>
              <div className="tp-skeleton h-8 w-64 rounded-md mb-2"></div>
              <div className="tp-skeleton h-4 w-48 rounded-md"></div>
            </div>
            <div className="flex gap-3">
              <div className="tp-skeleton h-9 w-24 rounded-md"></div>
              <div className="tp-skeleton h-9 w-32 rounded-md"></div>
            </div>
          </div>
          <div className="tp-skeleton h-48 w-full rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="tp-skeleton h-24 rounded-xl"></div>
            <div className="tp-skeleton h-24 rounded-xl"></div>
            <div className="tp-skeleton h-24 rounded-xl"></div>
            <div className="tp-skeleton h-24 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-tp-bg overflow-auto">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Welcome Header */}
        <motion.div variants={fadeUpItem} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-tp-border">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-tp-foreground">
              {greeting}, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className="text-sm text-tp-muted mt-1.5">
              Here is your executive overview for <span className="font-medium text-tp-foreground">{activeWorkspace?.name || 'your workspace'}</span>.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setShowInviteModal(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-tp-surface border border-tp-border text-sm font-medium text-tp-foreground transition-colors hover:border-tp-border-strong hover:bg-tp-elevated"
            >
              <UserPlus size={16} className="text-tp-muted" />
              Invite Team
            </button>
            <button 
              onClick={() => onCreateTask?.()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md bg-tp-accent text-sm font-medium text-tp-accent-foreground shadow-tp-sm transition-colors hover:bg-tp-accent-hover"
            >
              <Plus size={16} />
              New Task
            </button>
          </div>
        </motion.div>

        {/* AI Focus Panel */}
        <motion.div variants={fadeUpItem} className="relative overflow-hidden rounded-xl bg-tp-surface p-6 shadow-tp-md">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-ai-gradient opacity-10 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-tp-accent-soft text-tp-accent">
              <Sparkles size={16} />
            </span>
            <h2 className="text-base font-semibold text-tp-foreground">AI Priority Focus</h2>
          </div>
          
          <div className="relative z-10 grid gap-3 md:grid-cols-3">
            {aiRecommendedTasks.length === 0 ? (
              <div className="col-span-3 rounded-lg border border-tp-border bg-tp-bg p-6 text-center">
                <CheckCircle2 size={24} className="mx-auto mb-2 text-tp-success" />
                <p className="text-sm font-medium text-tp-foreground">No urgent priorities</p>
                <p className="text-xs text-tp-muted mt-1">You are completely caught up on critical tasks.</p>
              </div>
            ) : (
              aiRecommendedTasks.map((task) => {
                const priority = getPriorityTag(task.ai?.priority || 0);
                return (
                  <div 
                    key={task._id}
                    onClick={() => navigate(`/dashboard/task/${task._id}`)}
                    className="group flex flex-col justify-between rounded-lg border border-tp-border bg-tp-bg p-4 transition-all hover:-translate-y-0.5 hover:border-tp-accent hover:shadow-tp-sm cursor-pointer"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm text-tp-foreground line-clamp-2">{task.title}</h4>
                        <span className={cn("shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider", priority.class)}>
                          {priority.label}
                        </span>
                      </div>
                      {task.ai?.reasoning && (
                        <p className="text-xs text-tp-muted line-clamp-2 leading-relaxed">
                          {task.ai.reasoning}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-tp-border pt-3">
                      <span className="text-[11px] font-medium text-tp-muted">
                        Score: {task.ai?.priority || 0}/100
                      </span>
                      <ChevronRight size={14} className="text-tp-subtle opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-tp-accent" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Metrics Row */}
        <motion.div variants={fadeUpItem} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-tp-border bg-tp-surface p-5 shadow-tp-sm">
            <div className="flex items-center gap-2 text-tp-muted mb-2">
              <AlertCircle size={14} className="text-tp-danger" />
              <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            </div>
            <p className={cn("text-2xl font-semibold", overdue > 0 ? "text-tp-danger" : "text-tp-foreground")}>
              {overdue}
            </p>
          </div>
          
          <div className="rounded-xl border border-tp-border bg-tp-surface p-5 shadow-tp-sm">
            <div className="flex items-center gap-2 text-tp-muted mb-2">
              <CalendarClock size={14} className="text-tp-warning" />
              <span className="text-xs font-semibold uppercase tracking-wider">Due Today</span>
            </div>
            <p className={cn("text-2xl font-semibold", dueToday > 0 ? "text-tp-warning" : "text-tp-foreground")}>
              {dueToday}
            </p>
          </div>
          
          <div className="rounded-xl border border-tp-border bg-tp-surface p-5 shadow-tp-sm">
            <div className="flex items-center gap-2 text-tp-muted mb-2">
              <Calendar size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Upcoming</span>
            </div>
            <p className="text-2xl font-semibold text-tp-foreground">
              {upcoming}
            </p>
          </div>

          <div className="rounded-xl border border-tp-border bg-tp-surface p-5 shadow-tp-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 p-4 opacity-10"><Activity size={64} /></div>
            <div className="flex items-center gap-2 text-tp-muted mb-2 relative z-10">
              <CheckCircle2 size={14} className="text-tp-success" />
              <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
            </div>
            <p className="text-2xl font-semibold text-tp-success relative z-10">
              {tasks.filter(t => t.status === 'done').length}
            </p>
          </div>
        </motion.div>

        {/* 2-Column Layout */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Projects Column */}
          <motion.div variants={fadeUpItem} className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-tp-foreground">Active Projects</h3>
              <button 
                onClick={() => navigate(`/dashboard/${activeWorkspace?.slug || activeWorkspace?._id || 'workspace'}/projects`)}
                className="text-xs font-medium text-tp-accent hover:text-tp-accent-hover transition-colors"
              >
                View all
              </button>
            </div>
            
            <div className="grid gap-3">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-tp-border-strong bg-tp-surface py-12 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-tp-bg text-tp-muted">
                    <LayoutGrid size={18} />
                  </div>
                  <p className="text-sm font-medium text-tp-foreground">No active projects</p>
                  <p className="text-xs text-tp-muted mt-1">Create a project to organize your tasks.</p>
                </div>
              ) : (
                projects.slice(0, 4).map(project => (
                  <div 
                    key={project._id}
                    onClick={() => navigate(`/dashboard/${activeWorkspace?.slug || activeWorkspace?._id}/projects/${project._id}`)}
                    className="group rounded-xl border border-tp-border bg-tp-surface p-4 transition-all hover:border-tp-border-strong hover:shadow-tp-sm cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-tp-foreground line-clamp-1 group-hover:text-tp-accent transition-colors">
                        {project.name}
                      </h4>
                      <span className="text-xs font-medium text-tp-muted bg-tp-bg px-2 py-0.5 rounded-md">
                        {project.progress || 0}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-tp-bg">
                      <div 
                        className="h-full bg-tp-accent rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${project.progress || 0}%` }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Activity Column */}
          <motion.div variants={fadeUpItem} className="space-y-4">
            <div className="px-1">
              <h3 className="text-sm font-semibold text-tp-foreground">Team Activity</h3>
            </div>
            
            <div className="rounded-xl border border-tp-border bg-tp-surface p-5 shadow-tp-sm">
              {recentActivity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Activity size={24} className="text-tp-muted mb-2 opacity-50" />
                  <p className="text-sm font-medium text-tp-foreground">Quiet in here...</p>
                  <p className="text-xs text-tp-muted mt-1">Activity will show up when tasks are updated.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-tp-border ml-3 space-y-6">
                  {recentActivity.map((task) => {
                    const assignee = task.assignedTo?.name || 'Someone';
                    const action = task.status === 'done' ? 'completed' : task.updatedAt ? 'updated' : 'created';
                    
                    const dateVal = task.updatedAt || task.createdAt;
                    const dateObj = dateVal ? new Date(dateVal) : new Date();
                    
                    // User requested absolute date timestamp formatting
                    const formattedDate = format(dateObj, "MMM d, yyyy 'at' h:mm a");

                    return (
                      <div key={task._id} className="relative pl-6">
                        <div className="absolute -left-[17px] top-1 flex h-8 w-8 items-center justify-center rounded-full bg-tp-surface">
                          <Avatar name={assignee} size={28} />
                        </div>
                        <div>
                          <p className="text-sm text-tp-foreground">
                            <span className="font-semibold">{assignee}</span> {action}{' '}
                            <span className="font-medium text-tp-accent cursor-pointer hover:underline" onClick={() => navigate(`/dashboard/task/${task._id}`)}>
                              {task.title}
                            </span>
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-tp-muted uppercase tracking-wide">
                            {formattedDate}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
      
      {showInviteModal && (
        <InviteTeamModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}
