import React, { useState, useEffect } from 'react';
import { useProjectFilters } from '../../hooks/useProjectFilters';
import { ProjectFilterBar } from './ProjectFilterBar';
import { ProjectFilterChips } from './ProjectFilterChips';
import { KanbanView } from './KanbanView';
import { ListView } from './ListView';
import { LayoutGrid, List } from 'lucide-react';
import { Button } from '../ui/button';
import { useParams } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../api/client';

export default function TaskBoard() {
  const { teamSlug, projectId, viewId } = useParams();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  
  useEffect(() => {
    if (teamSlug) {
      const ws = workspaces.find(w => w.slug === teamSlug || w._id === teamSlug);
      if (ws && ws._id !== activeWorkspace?._id) {
        setActiveWorkspace(ws);
      }
    }
  }, [teamSlug, workspaces, activeWorkspace, setActiveWorkspace]);

  const workspaceId = activeWorkspace?._id || localStorage.getItem('tp-workspace-id');
  
  const {
    filters,
    updateFilter,
    resetFilters,
    tasks,
    setTasks,
    members,
    loading,
    hasMore,
    loadMore,
    fetchTasks
  } = useProjectFilters(workspaceId, projectId, viewId);

  const [viewMode, setViewMode] = useState(localStorage.getItem('tp-view-mode') || 'kanban');

  useEffect(() => {
    localStorage.setItem('tp-view-mode', viewMode);
  }, [viewMode]);

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`, { data: { workspaceId } });
        setTasks(prev => prev.filter(t => (t._id || t.id) !== taskId));
      } catch (err) {
        console.error('Failed to delete task', err);
        alert('Failed to delete task');
      }
    }
  };

  const handleEditTask = (taskId) => {
    console.log('Edit task', taskId);
    // In a real app, this would open a TaskDetailPanel or Drawer
    // setEditingTaskId(taskId);
    alert(`Opening edit panel for task: ${taskId}`);
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => (t._id === taskId || t.id === taskId) ? { ...t, status: newStatus } : t));
    
    try {
      await api.patch(`/tasks/${taskId}`, { workspaceId, status: newStatus });
    } catch (err) {
      console.error('Failed to update task status', err);
      // Revert if failed
      fetchTasks(); // Reload from backend
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="tp-projects-header">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage and filter all workspace tasks.</p>
        </div>
        
        <div className="tp-view-toggle">
          <button 
            className={`flex items-center gap-2 ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
            List
          </button>
          <button 
            className={`flex items-center gap-2 ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            <LayoutGrid size={16} />
            Board
          </button>
        </div>
      </div>

      {/* Filters */}
      <ProjectFilterBar 
        filters={filters} 
        updateFilter={updateFilter} 
        resetFilters={resetFilters} 
        members={members} 
      />
      
      <ProjectFilterChips 
        filters={filters} 
        updateFilter={updateFilter} 
      />

      {/* Main Content */}
      <div className="flex-1 mt-2">
        {loading && tasks.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Loading tasks...
          </div>
        ) : (
          <>
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

            {/* Pagination / Load More */}
            {hasMore && (
              <div className="flex justify-center mt-6 pb-8">
                <Button 
                  variant="outline" 
                  onClick={loadMore} 
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
