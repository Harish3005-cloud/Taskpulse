import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useProjectCompatibility } from '../../hooks/useProjectCompatibility';
import api from '../../api/client';
import EmptyState from '../shared/EmptyState';
import { Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import EditProjectModal from './EditProjectModal';

export default function ProjectDashboard({ onCreateProject }) {
  const { teamSlug } = useParams();
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const { projects: initialProjects, loading: initialLoading } = useProjectCompatibility();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  
  useEffect(() => {
    if (initialProjects) {
      setProjects(initialProjects);
      setLoading(initialLoading);
    }
  }, [initialProjects, initialLoading]);
  useEffect(() => {
    const ws = workspaces.find(w => w.slug === teamSlug || w._id === teamSlug);
    if (ws && ws._id !== activeWorkspace?._id) {
      setActiveWorkspace(ws);
    }
  }, [teamSlug, workspaces, activeWorkspace, setActiveWorkspace]);

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'in-progress': return 'bg-blue-500/10 text-blue-500';
      case 'review': return 'bg-purple-500/10 text-purple-500';
      case 'done': return 'bg-green-500/10 text-green-500';
      case 'todo': 
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      await api.patch(`/projects/${editingProject._id}`, { ...formData, workspaceId: activeWorkspace._id });
      setEditingProject(null);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to edit project');
    }
  };

  const handleDelete = async (e, projectId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await api.delete(`/projects/${projectId}`, { data: { workspaceId: activeWorkspace._id } });
        setProjects(prev => prev.filter(p => p._id !== projectId));
      } catch (err) {
        console.error(err);
        alert('Failed to delete project');
      }
    }
  };

  return (
    <div className="flex flex-col h-full relative" style={{ padding: '32px' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--tp-text)]">Projects</h1>
          <p className="text-[var(--tp-text-muted)] mt-1 text-sm">Manage all projects for {activeWorkspace?.name}</p>
        </div>
        <button 
          onClick={onCreateProject}
          className="flex items-center gap-2 bg-[var(--tp-accent)] text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-[var(--tp-text-muted)]">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="flex-1">
          <EmptyState
            icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>}
            title="No projects yet"
            description="Create your first project to start organizing tasks."
            actionLabel="Create Project"
            onAction={onCreateProject}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div 
              key={project._id} 
              className="bg-[var(--tp-surface)] border border-[var(--tp-border-subtle)] rounded-xl p-5 hover:border-[var(--tp-border)] transition-colors cursor-pointer relative group"
              onClick={() => navigate(`/${teamSlug}/projects/${project._id}`)}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-[var(--tp-text)] text-lg">{project.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(project.status || 'todo')}`}>
                    {project.status || 'todo'}
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingProject(project); }}
                      className="p-1 hover:bg-[var(--tp-bg)] rounded text-[var(--tp-text-muted)]"
                      title="Edit Project"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(e, project._id)}
                      className="p-1 hover:bg-[var(--tp-bg)] rounded text-red-500"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[var(--tp-text-muted)] text-sm mb-6 line-clamp-2">{project.summary || 'No summary provided.'}</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1 text-[var(--tp-text-muted)]">
                    <span>Progress</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-[var(--tp-border-subtle)] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[var(--tp-accent)] h-full rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-[var(--tp-border-subtle)]">
                  <div className="flex -space-x-2">
                    {(project.members || []).slice(0, 3).map((m, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-[var(--tp-bg)] border border-[var(--tp-border)] flex items-center justify-center text-[10px] font-bold text-[var(--tp-text)]">
                        {m.name?.charAt(0) || 'U'}
                      </div>
                    ))}
                    {(project.members?.length || 0) > 3 && (
                      <div className="w-6 h-6 rounded-full bg-[var(--tp-surface-hover)] border border-[var(--tp-border)] flex items-center justify-center text-[10px] font-medium text-[var(--tp-text-muted)]">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-[var(--tp-text-muted)] font-medium">
                    {project.totalTasks || project.taskCount || 0} tasks
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button 
        onClick={onCreateProject}
        className="absolute bottom-8 right-8 w-12 h-12 bg-[var(--tp-accent)] text-white rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
        title="Create New Project"
      >
        <Plus size={24} />
      </button>

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
