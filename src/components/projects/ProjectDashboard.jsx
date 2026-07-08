import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useProjectCompatibility } from '../../hooks/useProjectCompatibility';
import api from '../../api/client';
import EmptyState from '../shared/EmptyState';
import { Plus, Edit2, Trash2, LayoutGrid, CheckCircle2, Clock, AlertCircle, Paperclip, Sparkles } from 'lucide-react';
import EditProjectModal from './EditProjectModal';
import Avatar from '../shared/Avatar';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

// Circular Progress Component
const CircularProgress = ({ progress = 0, size = 48, strokeWidth = 4 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle 
          cx={size/2} cy={size/2} r={radius} 
          stroke="currentColor" 
          strokeWidth={strokeWidth} 
          fill="none" 
          className="text-tp-border-strong"
        />
        <circle 
          cx={size/2} cy={size/2} r={radius} 
          stroke="currentColor" 
          strokeWidth={strokeWidth} 
          fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          className="text-tp-accent transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-tp-foreground">{progress}%</span>
    </div>
  );
};

export default function ProjectDashboard() {
  const { teamSlug } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const onCreateProject = outletContext?.onCreateProject;
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
      case 'in-progress': return 'bg-tp-info-soft text-tp-info';
      case 'review': return 'bg-tp-warning-soft text-tp-warning';
      case 'done': return 'bg-tp-success-soft text-tp-success';
      case 'todo': 
      default: return 'bg-tp-border text-tp-muted';
    }
  };

  const getHealthStatus = (project) => {
    // Derive health if not explicitly present
    const overdue = project.overdueTasks || 0;
    const progress = project.progress || 0;
    
    if (project.status === 'done' || progress === 100) return { label: 'Completed', class: 'text-tp-success', icon: CheckCircle2 };
    if (overdue > 3) return { label: 'At Risk', class: 'text-tp-danger', icon: AlertCircle };
    if (overdue > 0) return { label: 'Needs Attention', class: 'text-tp-warning', icon: Clock };
    return { label: 'On Track', class: 'text-tp-success', icon: CheckCircle2 };
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

  if (loading) {
    return (
      <div className="flex-1 p-6 md:p-8 bg-tp-bg overflow-auto flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-tp-muted">
          <div className="w-8 h-8 border-4 border-tp-border-strong border-t-tp-accent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative h-full bg-tp-bg overflow-hidden">
      <div className="flex-1 overflow-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-tp-foreground">Projects</h1>
              <p className="text-tp-muted mt-1 text-sm">Manage all projects for <span className="font-semibold">{activeWorkspace?.name}</span></p>
            </div>
            <button 
              onClick={onCreateProject}
              className="flex items-center gap-2 bg-tp-accent text-tp-accent-foreground px-4 py-2 rounded-md font-medium shadow-tp-sm hover:bg-tp-accent-hover transition-colors"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="flex-1 flex items-center justify-center pb-20">
              <EmptyState
                icon={<LayoutGrid size={48} className="text-tp-muted" />}
                title="No projects yet"
                description="Create your first project to start organizing tasks and collaborating with your team."
                actionLabel="Create Project"
                onAction={onCreateProject}
              />
            </div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24"
            >
              <AnimatePresence>
                {projects.map(project => {
                  const health = getHealthStatus(project);
                  const HealthIcon = health.icon;
                  return (
                    <motion.div 
                      key={project._id}
                      variants={fadeUpItem}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => navigate(`/dashboard/${activeWorkspace?.slug || activeWorkspace?._id || 'workspace'}/projects/${project._id}`)}
                      className="group relative flex flex-col justify-between bg-tp-surface border border-tp-border rounded-xl p-5 hover:-translate-y-1 hover:shadow-tp-md hover:border-tp-accent transition-all duration-300 cursor-pointer overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-tp-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-opacity opacity-0 group-hover:opacity-100" />
                      
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <CircularProgress progress={project.progress || 0} size={42} strokeWidth={3.5} />
                          <div className="flex items-center gap-2">
                            {/* Mock Attachment Indicator */}
                            {project.attachments?.length > 0 ? (
                              <div className="flex items-center gap-1 text-tp-muted" title={`${project.attachments.length} attachments`}>
                                <Paperclip size={12} />
                                <span className="text-[10px] font-medium">{project.attachments.length}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-tp-muted/50" title="No attachments">
                                <Paperclip size={12} />
                                <span className="text-[10px] font-medium">0</span>
                              </div>
                            )}

                            <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider", getStatusColor(project.status))}>
                              {project.status || 'todo'}
                            </span>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-tp-foreground text-lg mb-1.5 line-clamp-1 group-hover:text-tp-accent transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-tp-muted text-xs line-clamp-2 leading-relaxed min-h-[32px]">
                          {project.summary || 'No summary provided.'}
                        </p>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 bg-tp-bg border border-tp-border w-fit px-2 py-1 rounded-md">
                            <HealthIcon size={12} className={health.class} />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-tp-foreground">{health.label}</span>
                          </div>
                          
                          {/* AI Insight Badge Placeholder */}
                          <div className="flex items-center gap-1 px-2 py-1 bg-tp-accent-soft rounded-md">
                            <Sparkles size={10} className="text-tp-accent" />
                            <span className="text-[9px] font-bold text-tp-accent uppercase tracking-wider">AI Insight</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-tp-border">
                          <div className="flex -space-x-2">
                            {(project.members || []).slice(0, 3).map((m, i) => (
                              <Avatar key={i} name={m.name || m.email} size={24} className="border-2 border-tp-surface" />
                            ))}
                            {(project.members?.length || 0) > 3 && (
                              <div className="w-6 h-6 rounded-full bg-tp-bg border-2 border-tp-surface flex items-center justify-center text-[9px] font-bold text-tp-muted z-10">
                                +{project.members.length - 3}
                              </div>
                            )}
                            {(!project.members || project.members.length === 0) && (
                              <span className="text-[11px] text-tp-muted italic">Unassigned</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingProject(project); }}
                              className="grid h-7 w-7 place-items-center rounded bg-tp-bg text-tp-muted hover:text-tp-foreground hover:bg-tp-surface-hover border border-transparent hover:border-tp-border transition-colors"
                              title="Edit Project"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(e, project._id)}
                              className="grid h-7 w-7 place-items-center rounded bg-tp-bg text-tp-danger/70 hover:text-tp-danger hover:bg-tp-danger-soft border border-transparent hover:border-tp-danger/30 transition-colors"
                              title="Delete Project"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

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
