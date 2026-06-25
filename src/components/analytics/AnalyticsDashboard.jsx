import { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useProjectCompatibility } from '../../hooks/useProjectCompatibility';
import api from '../../api/client';

export default function AnalyticsDashboard() {
  const { activeWorkspace } = useWorkspace();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    range: '7d'
  });
  
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { projects } = useProjectCompatibility();

  useEffect(() => {
    async function fetchAnalytics() {
      if (!activeWorkspace?._id) return;
      setLoading(true);
      try {
        const [statsRes, digestRes] = await Promise.all([
          api.get(`/analytics?workspaceId=${activeWorkspace._id}&range=7d`),
          api.get(`/analytics/digest?workspaceId=${activeWorkspace._id}`).catch(() => ({ data: null }))
        ]);
        
        if (statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
        if (digestRes.data?.digest) {
          setDigest(digestRes.data.digest);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [activeWorkspace]);

  return (
    <div className="flex-1 overflow-auto bg-[var(--bg-base)] text-[var(--text-primary)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Executive Analytics</h1>
          <p className="text-[var(--text-muted)]">Performance overview for {activeWorkspace?.name || 'Workspace'}</p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Total Tasks</p>
            <div className="text-3xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-green-500 mt-2 font-medium">↑ 12% vs last week</p>
          </div>
          <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Completed</p>
            <div className="text-3xl font-bold text-[var(--accent)]">{stats.completedTasks}</div>
            <p className="text-xs text-green-500 mt-2 font-medium">↑ 8% vs last week</p>
          </div>
          <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Overdue</p>
            <div className="text-3xl font-bold text-red-500">{stats.overdueTasks}</div>
            <p className="text-xs text-red-500 mt-2 font-medium">↑ 2% vs last week</p>
          </div>
          <div className="bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5"></div>
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2 relative z-10">AI Completion Rate</p>
            <div className="text-3xl font-bold text-indigo-500 relative z-10">{stats.completionRate}%</div>
            <p className="text-xs text-indigo-400 mt-2 font-medium relative z-10">On track</p>
          </div>
        </div>

        {/* Main Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Task Completion Trend (Custom CSS Chart) */}
          <div className="col-span-1 lg:col-span-2 bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-subtle)] shadow-sm">
            <h2 className="text-lg font-bold mb-6">Task Completion Trends</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {/* Mock Bar Chart */}
              {[40, 60, 45, 80, 50, 75, 90].map((val, idx) => (
                <div key={idx} className="w-full flex flex-col items-center gap-2 group">
                  <div className="w-full bg-[var(--accent)] rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity" style={{ height: `${val}%` }}></div>
                  <span className="text-xs text-[var(--text-muted)]">Day {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Generated Insights */}
          <div className="col-span-1 bg-gradient-to-b from-indigo-500/10 to-transparent p-6 rounded-xl border border-indigo-500/20 shadow-sm relative overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-500"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
              <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">AI Insights</h2>
            </div>
            
            <div className="space-y-4 flex-1">
              {digest ? (
                <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] h-full overflow-auto">
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap">{digest.content || digest.summary}</p>
                </div>
              ) : (
                <div className="p-4 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-subtle)] flex items-center justify-center h-full text-sm text-[var(--text-muted)]">
                  No digest available for this week.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Progress Table */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--border-subtle)]">
            <h2 className="text-lg font-bold">Project Health</h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--bg-base)] text-[var(--text-muted)]">
              <tr>
                <th className="p-4 font-medium">Project</th>
                <th className="p-4 font-medium">Lead</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-[var(--text-muted)] text-sm">No active projects found.</td>
                </tr>
              ) : (
                projects.map(project => (
                  <tr key={project._id}>
                    <td className="p-4 font-medium">{project.name}</td>
                    <td className="p-4">
                      {project.owner ? (
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold" title={project.owner}>
                          {project.owner.substring(0, 2).toUpperCase()}
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--text-muted)]">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold rounded-md ${
                        project.status?.toLowerCase() === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                        project.status?.toLowerCase() === 'on hold' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        {project.status || 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[100px] h-2 bg-[var(--bg-base)] rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${project.progress || 0}%` }}></div>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">{project.progress || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
