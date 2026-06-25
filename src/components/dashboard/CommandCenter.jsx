import React, { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useProjectCompatibility } from '../../hooks/useProjectCompatibility';
import { formatDistanceToNow, isToday, isBefore, startOfDay, endOfDay } from 'date-fns';
import InviteTeamModal from '../team/InviteTeamModal';

export default function CommandCenter() {
  const { user } = useAuth();
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const { activeWorkspace, tasks } = useWorkspace();
  const { projects } = useProjectCompatibility();

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
        // Since it's not before todayStart and before todayEnd, it falls exactly on today
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

  return (
    <div className="flex-1 p-8 bg-[var(--bg-base)] overflow-auto text-[var(--text-primary)]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Welcome Header */}
        <div className="flex justify-between items-end pb-6 border-b border-[var(--border-subtle)]">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{greeting}, {user?.name?.split(' ')[0] || 'User'}!</h1>
            <p className="text-[var(--text-muted)] mt-1">Here is what's happening in <span className="font-semibold text-[var(--text-primary)]">{activeWorkspace?.name || 'your workspace'}</span> today.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md font-medium hover:border-[var(--text-muted)] transition-colors"
            >
              Invite Team
            </button>
            <button 
              onClick={() => onCreateTask?.()}
              className="px-4 py-2 bg-[var(--accent)] text-white rounded-md font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              Create Task
            </button>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* AI Focus Panel (Span 8) */}
          <div className="col-span-1 lg:col-span-8 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-md">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
              </span>
              <h2 className="text-xl font-bold">AI Focus Panel</h2>
            </div>
            <p className="text-[var(--text-muted)] text-sm mb-6 relative z-10">TaskPulse recommends focusing on these high-priority items based on your current workload and upcoming deadlines.</p>
            
            <div className="space-y-3 relative z-10">
              {aiRecommendedTasks.length === 0 ? (
                <div className="text-sm text-[var(--text-muted)] italic">No AI recommendations available. Keep up the good work!</div>
              ) : (
                aiRecommendedTasks.map(task => (
                  <div 
                    key={task._id} 
                    onClick={() => navigate(`/dashboard/task/${task._id}`)}
                    className="flex items-center justify-between p-4 bg-[var(--bg-base)] rounded-lg border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${task.ai?.urgency === 'critical' ? 'bg-red-500' : 'bg-orange-500'}`}></span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm">{task.title}</h4>
                          {task.ai?.priority && (
                            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded font-mono">
                              Score: {task.ai.priority}
                            </span>
                          )}
                        </div>
                        {task.ai?.reasoning && <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">{task.ai.reasoning}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${task.ai?.urgency === 'critical' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        {task.ai?.urgency || 'high'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Day (Span 4) */}
          <div className="col-span-1 lg:col-span-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 flex flex-col shadow-sm">
            <h2 className="text-xl font-bold mb-1">My Day</h2>
            <p className="text-[var(--text-muted)] text-sm mb-6">Your personal agenda.</p>
            
            <div className="flex-1 space-y-4">
              {overdue === 0 && dueToday === 0 && upcoming === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-primary)]">You're all caught up!</span>
                  <span className="text-xs text-[var(--text-muted)]">No tasks scheduled for today.</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)]">
                    <span className="text-sm font-medium">Overdue</span>
                    <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${overdue > 0 ? 'bg-red-500/10 text-red-500' : 'bg-[var(--border-subtle)] text-[var(--text-muted)]'}`}>{overdue}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[var(--border-subtle)]">
                    <span className="text-sm font-medium">Due Today</span>
                    <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold ${dueToday > 0 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--border-subtle)] text-[var(--text-muted)]'}`}>{dueToday}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[var(--text-muted)]">Upcoming</span>
                    <span className="text-xs font-bold text-[var(--text-muted)]">{upcoming}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Project Overview (Span 6) */}
          <div className="col-span-1 lg:col-span-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Project Overview</h2>
              <button 
                onClick={() => navigate(`/dashboard/${activeWorkspace?.slug || activeWorkspace?._id || 'workspace'}/projects`)}
                className="text-xs text-[var(--accent)] font-semibold hover:underline"
              >
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="text-sm text-[var(--text-muted)]">No active projects.</div>
              ) : (
                projects.slice(0, 4).map(project => (
                  <div key={project._id} className="p-4 border border-[var(--border-subtle)] rounded-lg hover:border-[var(--text-muted)] transition-colors cursor-pointer">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-semibold text-sm line-clamp-1">{project.name}</h4>
                      <span className="text-xs text-[var(--text-muted)]">{project.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-base)] h-2 rounded-full overflow-hidden">
                      <div className="bg-[var(--accent)] h-full" style={{ width: `${project.progress || 0}%` }}></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Team Activity Feed (Span 6) */}
          <div className="col-span-1 lg:col-span-6 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Team Activity</h2>
            
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-sm text-[var(--text-muted)]">No recent activity.</div>
              ) : (
                recentActivity.map(task => {
                  const assignee = task.assignedTo?.name || 'Someone';
                  const initials = assignee.substring(0, 2).toUpperCase();
                  const action = task.status === 'done' ? 'completed' : task.updatedAt ? 'updated' : 'created';
                  const date = task.updatedAt || task.createdAt;

                  return (
                    <div key={task._id} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0" title={assignee}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm"><span className="font-semibold">{assignee}</span> {action} task <span className="font-medium text-[var(--accent)]">{task.title}</span></p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : 'Recently'}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
      
      {showInviteModal && (
        <InviteTeamModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}
