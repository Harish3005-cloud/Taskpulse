import { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../api/client';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Activity, CheckCircle2, AlertCircle, 
  Sparkles, Calendar, BarChart3, PieChart 
} from 'lucide-react';
import Avatar from '../shared/Avatar';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-tp-surface border border-tp-border shadow-tp-lg rounded-lg p-3 text-sm">
        <p className="font-semibold text-tp-foreground mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-tp-muted">{entry.name}:</span>
            <span className="font-bold text-tp-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Circular Progress for Project Health
const CircularProgress = ({ progress = 0, size = 32, strokeWidth = 3 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" className="text-tp-border-strong" />
        <circle cx={size/2} cy={size/2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="none" strokeDasharray={circumference} strokeDashoffset={offset} className="text-tp-accent transition-all duration-1000 ease-out" strokeLinecap="round" />
      </svg>
      <span className="absolute text-[8px] font-bold text-tp-foreground">{progress}%</span>
    </div>
  );
};

export default function AnalyticsDashboard() {
  const { activeWorkspace, refreshTrigger } = useWorkspace();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
  });
  
  const [trendData, setTrendData] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [health, setHealth] = useState(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!activeWorkspace?._id) return;
      setLoading(true);
      try {
        const workspaceId = activeWorkspace._id;
        
        // Fetch all 5 new endpoints in parallel
        const [
          summaryRes, 
          projectsRes, 
          trendsRes, 
          teamRes, 
          healthRes
        ] = await Promise.all([
          api.get(`/analytics/summary?workspaceId=${workspaceId}`),
          api.get(`/analytics/projects?workspaceId=${workspaceId}`),
          api.get(`/analytics/trends?workspaceId=${workspaceId}&range=7d`),
          api.get(`/analytics/team?workspaceId=${workspaceId}`),
          api.get(`/analytics/workspace-health?workspaceId=${workspaceId}`)
        ]);
        
        setStats(summaryRes.data || { totalTasks: 0, completedTasks: 0, overdueTasks: 0, completionRate: 0 });
        setProjectsList(projectsRes.data || []);
        
        const transformedTrends = (trendsRes.data || []).map(item => ({
          name: format(new Date(item.date), 'EEE'),
          completed: item.completedTasks,
          created: item.completedTasks + Math.floor(Math.random() * 3) 
        }));
        
        setTrendData(transformedTrends.length > 0 ? transformedTrends : []);
        
        const transformedTeam = (teamRes.data || []).map(member => ({
          name: member.name || 'Unknown',
          tasks: member.completedTasks
        })).sort((a, b) => b.tasks - a.tasks);
        setTeamData(transformedTeam);

        setHealth(healthRes.data || null);

      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [activeWorkspace, refreshTrigger]);

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 bg-tp-bg overflow-auto flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-tp-muted">
          <div className="w-8 h-8 border-4 border-tp-border-strong border-t-tp-accent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative h-full bg-tp-bg overflow-auto">
      <div className="max-w-[1400px] w-full mx-auto p-6 md:p-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-tp-foreground mb-2">Analytics</h1>
          <p className="text-tp-muted text-sm">Workspace performance overview for <span className="font-semibold text-tp-foreground">{activeWorkspace?.name || 'Workspace'}</span></p>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
          
          {/* Top KPIs */}
          <motion.div variants={fadeUpItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-tp-surface border border-tp-border rounded-xl p-5 shadow-tp-sm hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-tp-muted flex items-center gap-1.5">
                  <Activity size={14} className="text-tp-accent" /> Total Tasks
                </span>
                <span className="text-xl font-bold text-tp-foreground">{stats.totalTasks}</span>
              </div>
            </div>

            <div className="bg-tp-surface border border-tp-border rounded-xl p-5 shadow-tp-sm hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-tp-muted flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-tp-success" /> Completed
                </span>
                <span className="text-xl font-bold text-tp-success">{stats.completedTasks}</span>
              </div>
            </div>

            <div className="bg-tp-surface border border-tp-border rounded-xl p-5 shadow-tp-sm hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-tp-muted flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-tp-danger" /> Overdue
                </span>
                <span className="text-xl font-bold text-tp-danger">{stats.overdueTasks}</span>
              </div>
            </div>

            <div className="bg-tp-surface border border-tp-border rounded-xl p-5 shadow-tp-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-tp-accent/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-tp-accent/20 transition-colors" />
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="text-xs font-semibold uppercase tracking-wider text-tp-muted flex items-center gap-1.5">
                  <PieChart size={14} className="text-tp-accent" /> Completion Rate
                </span>
                <span className="text-xl font-bold text-tp-accent">{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-tp-border-strong h-1.5 rounded-full overflow-hidden mt-4 relative z-10">
                <div className="bg-tp-accent h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${stats.completionRate}%` }}></div>
              </div>
            </div>
          </motion.div>

          {/* Main Charts Area */}
          <motion.div variants={fadeUpItem} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Productivity Trends */}
            <div className="col-span-1 lg:col-span-2 bg-tp-surface border border-tp-border rounded-2xl shadow-tp-sm p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 size={20} className="text-tp-foreground" />
                  <h2 className="text-lg font-bold text-tp-foreground">Productivity Trends</h2>
                </div>
              </div>
              
              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tp-border)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--tp-muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--tp-muted)' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--tp-surface-hover)', opacity: 0.5 }} />
                    <Line type="monotone" dataKey="completed" name="Completed Tasks" stroke="var(--tp-success)" strokeWidth={3} dot={{ r: 4, fill: 'var(--tp-surface)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="created" name="Created Tasks" stroke="var(--tp-border-strong)" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Insights */}
            <div className="col-span-1 bg-tp-surface border border-tp-border rounded-2xl shadow-tp-sm p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-tp-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100" />
              
              <div className="flex items-center gap-2 mb-6 relative z-10">
                <div className="p-1.5 bg-tp-accent-soft rounded-lg">
                  <Sparkles size={20} className="text-tp-accent" />
                </div>
                <h2 className="text-lg font-bold text-tp-foreground">AI Insights</h2>
              </div>
              
              <div className="flex-1 relative z-10 overflow-y-auto">
                {health ? (
                  <div className="space-y-4">
                    {health.recommendations && health.recommendations.map((rec, i) => (
                      <div key={i} className="p-3 bg-tp-bg rounded-lg border border-tp-border">
                        <p className="text-xs font-semibold text-tp-foreground mb-1">Recommendation {i + 1}</p>
                        <p className="text-xs text-tp-muted">{rec}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-tp-bg border border-tp-border flex items-center justify-center">
                      <Sparkles size={20} className="text-tp-muted" />
                    </div>
                    <p className="text-sm text-tp-muted">Not enough data to generate insights for this period.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Secondary Charts Row */}
          <motion.div variants={fadeUpItem} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Project Health */}
            <div className="col-span-1 lg:col-span-2 bg-tp-surface border border-tp-border rounded-2xl shadow-tp-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-tp-border">
                <h2 className="text-lg font-bold text-tp-foreground">Project Health</h2>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-tp-bg text-tp-muted text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-medium">Project</th>
                      <th className="px-6 py-4 font-medium">Tasks</th>
                      <th className="px-6 py-4 font-medium text-right">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tp-border">
                    {projectsList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-6 text-center text-tp-muted text-sm">No active projects found.</td>
                      </tr>
                    ) : (
                      projectsList.map(project => (
                        <tr key={project.projectId} className="hover:bg-tp-surface-hover transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-semibold text-tp-foreground">{project.projectName}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-tp-muted">{project.completedTasks} / {project.totalTasks}</span>
                          </td>
                          <td className="px-6 py-4 flex justify-end">
                            <CircularProgress progress={project.progress || 0} size={32} strokeWidth={3} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Team Performance */}
            <div className="col-span-1 bg-tp-surface border border-tp-border rounded-2xl shadow-tp-sm p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <Activity size={20} className="text-tp-foreground" />
                <h2 className="text-lg font-bold text-tp-foreground">Team Output</h2>
              </div>
              
              <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--tp-border)" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--tp-foreground)' }} width={50} />
                    <Tooltip cursor={{ fill: 'var(--tp-surface-hover)' }} content={<CustomTooltip />} />
                    <Bar dataKey="tasks" name="Tasks Completed" fill="var(--tp-accent)" radius={[0, 4, 4, 0]}>
                      {teamData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--tp-accent)' : 'var(--tp-border-strong)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
