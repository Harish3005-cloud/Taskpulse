import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useProjectFilters } from '../../hooks/useProjectFilters';
import { KanbanView } from './KanbanView';
import { ListView } from './ListView';
import { LayoutGrid, List, ArrowLeft, Calendar, Users, Tag, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import api from '../../api/client';

export default function ProjectDetails() {
  const { teamSlug, projectId } = useParams();
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');

  useEffect(() => {
    if (teamSlug) {
      const ws = workspaces.find(w => w.slug === teamSlug || w._id === teamSlug);
      if (ws && ws._id !== activeWorkspace?._id) {
        setActiveWorkspace(ws);
      }
    }
  }, [teamSlug, workspaces, activeWorkspace, setActiveWorkspace]);

  const workspaceId = activeWorkspace?._id || localStorage.getItem('tp-workspace-id');

  useEffect(() => {
    if (!workspaceId || !projectId) return;
    
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
    fetchProjectDetails();
  }, [workspaceId, projectId]);

  // Tasks logic
  const { tasks, setTasks, fetchTasks } = useProjectFilters(workspaceId, projectId, null);

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? { ...t, status: newStatus } : t));
    try {
      await api.patch(`/tasks/${taskId}`, { workspaceId, status: newStatus });
    } catch (err) {
      console.error('Failed to update task status', err);
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`, { data: { workspaceId } });
        setTasks(prev => prev.filter(t => (t._id || t.id) !== taskId));
      } catch (err) {
        console.error('Failed to delete task', err);
      }
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center text-[var(--tp-text-muted)]">Loading project details...</div>;
  }

  if (!project) {
    return <div className="flex h-full items-center justify-center text-[var(--tp-text-muted)]">Project not found.</div>;
  }

  return (
    <div className="flex flex-col h-full relative" style={{ padding: '32px', overflowY: 'auto' }}>
      <button 
        onClick={() => navigate(`/${teamSlug}/projects`)}
        className="flex items-center gap-2 text-sm text-[var(--tp-text-muted)] hover:text-[var(--tp-text)] mb-6 w-fit transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </button>

      {/* Overview Section */}
      <div className="bg-[var(--tp-surface)] border border-[var(--tp-border-subtle)] rounded-xl p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--tp-text)] mb-2">{project.name}</h1>
            <p className="text-[var(--tp-text-muted)]">{project.description || project.summary || 'No description provided.'}</p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-[var(--tp-bg)] border border-[var(--tp-border)] text-[var(--tp-text)]">
            {project.status || 'todo'}
          </span>
        </div>

        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-[var(--tp-border-subtle)]">
          {(project.startDate || project.targetDate) && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-[var(--tp-text-muted)] flex items-center gap-1"><Calendar size={14}/> Timeline</span>
              <span className="text-sm font-medium text-[var(--tp-text)]">
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} → {project.targetDate ? new Date(project.targetDate).toLocaleDateString() : 'TBD'}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-xs text-[var(--tp-text-muted)] flex items-center gap-1"><Users size={14}/> Team</span>
            <div className="flex -space-x-2">
              {(project.members || []).map((m, i) => (
                <div key={i} className="w-7 h-7 rounded-full bg-[var(--tp-bg)] border border-[var(--tp-border)] flex items-center justify-center text-[11px] font-bold text-[var(--tp-text)]" title={m.name || m.email}>
                  {m.name?.charAt(0) || m.email?.charAt(0) || 'U'}
                </div>
              ))}
              {(!project.members || project.members.length === 0) && (
                <span className="text-sm text-[var(--tp-text-muted)]">No members</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-[var(--tp-text-muted)] flex items-center gap-1"><Tag size={14}/> Labels</span>
            <div className="flex gap-2">
              {(project.labels || []).map((l, i) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs bg-[var(--tp-bg)] border border-[var(--tp-border)] text-[var(--tp-text)]">
                  {l}
                </span>
              ))}
              {(!project.labels || project.labels.length === 0) && (
                <span className="text-sm text-[var(--tp-text-muted)]">None</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[var(--tp-surface)] border border-[var(--tp-border-subtle)] rounded-xl p-5 flex flex-col justify-between">
          <span className="text-sm text-[var(--tp-text-muted)] mb-2">Overall Progress</span>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-3xl font-bold text-[var(--tp-text)]">{project.progress || 0}%</span>
          </div>
          <div className="w-full bg-[var(--tp-border-subtle)] h-2 rounded-full overflow-hidden">
            <div className="bg-[var(--tp-accent)] h-full rounded-full transition-all duration-500" style={{ width: `${project.progress || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-[var(--tp-surface)] border border-[var(--tp-border-subtle)] rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg"><List size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-[var(--tp-text)]">{project.totalTasks || 0}</div>
            <div className="text-xs text-[var(--tp-text-muted)]">Total Tasks</div>
          </div>
        </div>

        <div className="bg-[var(--tp-surface)] border border-[var(--tp-border-subtle)] rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg"><CheckCircle2 size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-[var(--tp-text)]">{project.completedTasks || 0}</div>
            <div className="text-xs text-[var(--tp-text-muted)]">Completed</div>
          </div>
        </div>

        <div className="bg-[var(--tp-surface)] border border-[var(--tp-border-subtle)] rounded-xl p-5 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg"><AlertCircle size={24}/></div>
          <div>
            <div className="text-2xl font-bold text-[var(--tp-text)]">{project.overdueTasks || 0}</div>
            <div className="text-xs text-[var(--tp-text-muted)]">Overdue</div>
          </div>
        </div>
      </div>

      {/* Tasks Viewer */}
      <div className="flex-1 flex flex-col min-h-[500px] bg-[var(--tp-surface)] border border-[var(--tp-border-subtle)] rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[var(--tp-text)]">Project Tasks</h2>
          <div className="flex items-center gap-2 bg-[var(--tp-bg)] p-1 rounded-lg border border-[var(--tp-border-subtle)]">
            <button 
              className={`px-3 py-1.5 flex items-center gap-2 text-sm rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-[var(--tp-surface)] shadow text-[var(--tp-text)]' : 'text-[var(--tp-text-muted)] hover:text-[var(--tp-text)]'}`}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid size={14} /> Board
            </button>
            <button 
              className={`px-3 py-1.5 flex items-center gap-2 text-sm rounded-md transition-colors ${viewMode === 'list' ? 'bg-[var(--tp-surface)] shadow text-[var(--tp-text)]' : 'text-[var(--tp-text-muted)] hover:text-[var(--tp-text)]'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={14} /> List
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {viewMode === 'kanban' ? (
            <KanbanView 
              tasks={tasks} 
              onEditTask={(id) => console.log('Edit task', id)} 
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          ) : (
            <ListView 
              tasks={tasks} 
              onEditTask={(id) => console.log('Edit task', id)} 
              onDeleteTask={handleDeleteTask} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
