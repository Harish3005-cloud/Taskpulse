import { useState, useMemo, useCallback, useEffect } from 'react';
import api from '../../api/client';
import { useWorkspace } from '../../context/WorkspaceContext';
import TaskRow from './TaskRow';
import TaskStatusBadge, { formatStatus, STATUS_ORDER } from './TaskStatusBadge';
import FilterBar from '../shared/FilterBar';
import EmptyState from '../shared/EmptyState';
import BulkActionBar from './BulkActionBar';
import TaskDetailPanel from './TaskDetailPanel';

const FILTER_TABS = [
  { key: 'all', label: 'All tasks' },
  { key: 'active', label: 'Active' },
  { key: 'backlog', label: 'Backlog' },
];

/**
 * TaskList — grouped-by-status issue list matching Linear's pattern.
 * Supports multi-select (checkboxes), bulk actions, and detail panel side-peek.
 */
export default function TaskList({ workspaceId, onCreateTask }) {
  const { getWorkspaceTasks, activeWorkspace, fetchTasks } = useWorkspace();
  const [activeFilter, setActiveFilter] = useState('active');
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');

  // Feature 3: Multi-select state
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());

  // Feature 4: Detail panel state
  const [detailPanelEnabled, setDetailPanelEnabled] = useState(false);
  const [previewTask, setPreviewTask] = useState(null);

  const wsId = workspaceId || activeWorkspace?._id;
  const allTasks = getWorkspaceTasks(wsId);

  // Fetch projects
  useEffect(() => {
    if (!wsId) return;
    const fetchProjects = async () => {
      try {
        const { data } = await api.get(`/projects?workspaceId=${wsId}`);
        setProjects(data.projects || []);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    };
    fetchProjects();
  }, [wsId]);

  // When selectedProject changes, fetch filtered tasks
  useEffect(() => {
    if (wsId) {
      fetchTasks(wsId, selectedProject);
    }
  }, [wsId, selectedProject, fetchTasks]);

  // Filter tasks based on active tab
  const filteredTasks = useMemo(() => {
    if (activeFilter === 'all') return allTasks;
    if (activeFilter === 'active') return allTasks.filter(t => !['backlog', 'cancelled'].includes(t.status));
    if (activeFilter === 'backlog') return allTasks.filter(t => t.status === 'backlog');
    return allTasks;
  }, [allTasks, activeFilter]);

  // Group tasks by status
  const groupedTasks = useMemo(() => {
    const groups = {};
    filteredTasks.forEach(task => {
      if (!groups[task.status]) groups[task.status] = [];
      groups[task.status].push(task);
    });
    // Sort groups by STATUS_ORDER
    return STATUS_ORDER
      .filter(status => groups[status]?.length > 0)
      .map(status => ({ status, tasks: groups[status] }));
  }, [filteredTasks]);

  const toggleGroup = (status) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  };

  // ── Multi-select handlers ──
  const handleToggleSelect = useCallback((taskId) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const handleSelectAllInGroup = useCallback((tasks, isAllSelected) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      tasks.forEach(t => {
        if (isAllSelected) next.delete(t._id);
        else next.add(t._id);
      });
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedTaskIds(new Set());
  }, []);

  const handleBulkActionComplete = useCallback(() => {
    handleClearSelection();
    if (wsId) fetchTasks(wsId);
  }, [wsId, fetchTasks, handleClearSelection]);

  // ── Detail panel handler ──
  const handlePreview = useCallback((task) => {
    setPreviewTask(task);
  }, []);

  const anySelected = selectedTaskIds.size > 0;

  if (allTasks.length === 0) {
    return (
      <div className="tp-main">
        <div className="tp-topbar">
          <div className="tp-topbar-left">
            <span className="tp-topbar-title">Tasks</span>
          </div>
        </div>
        <EmptyState
          icon={<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5"/><path d="M16 24h16M24 16v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          title="No tasks yet"
          description="Create your first task to get started with TaskPulse."
          actionLabel="Create new task"
          onAction={onCreateTask}
        />
      </div>
    );
  }

  return (
    <>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--tp-border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <FilterBar
            tabs={FILTER_TABS.map(t => ({
              ...t,
              count: t.key === 'all' ? allTasks.length : undefined,
            }))}
            activeTab={activeFilter}
            onChange={setActiveFilter}
          />
          
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{ 
              background: 'transparent', 
              border: '1px solid var(--tp-border-subtle)', 
              color: 'var(--tp-foreground)',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="tp-sub-filter-actions" style={{ paddingRight: 16 }}>
          {/* Filter icon */}
          <button className="tp-icon-btn" title="Filter">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
          {/* Group-by icon */}
          <button className="tp-icon-btn" title="Group by">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 3h12M2 7h8M2 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
          {/* Detail panel toggle */}
          <button
            className={`tp-icon-btn ${detailPanelEnabled ? 'active' : ''}`}
            title={detailPanelEnabled ? 'Disable side peek' : 'Enable side peek'}
            onClick={() => {
              setDetailPanelEnabled(!detailPanelEnabled);
              if (detailPanelEnabled) setPreviewTask(null);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M10 2v12" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
          </button>
          {/* Layout toggle icon */}
          <button className="tp-icon-btn" title="Display">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/></svg>
          </button>
        </div>
      </div>

      {/* Task List with optional detail panel */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Task List */}
        <div className="tp-task-list" style={{ flex: 1 }}>
          {groupedTasks.map(({ status, tasks }) => {
            const groupAllSelected = tasks.every(t => selectedTaskIds.has(t._id));
            const groupSomeSelected = tasks.some(t => selectedTaskIds.has(t._id));

            return (
              <div key={status} className="tp-status-group">
                {/* Group Header */}
                <div
                  className="tp-status-group-header"
                  onClick={() => toggleGroup(status)}
                >
                  {/* Group select checkbox */}
                  <span
                    className={`tp-group-checkbox ${anySelected ? 'visible' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAllInGroup(tasks, groupAllSelected);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={groupAllSelected}
                      ref={el => { if (el) el.indeterminate = groupSomeSelected && !groupAllSelected; }}
                      onChange={() => {}}
                      className="tp-checkbox"
                      tabIndex={-1}
                    />
                  </span>

                  <span className={`tp-status-group-chevron ${collapsedGroups.has(status) ? 'collapsed' : ''}`}>▾</span>
                  <TaskStatusBadge status={status} />
                  <span>{formatStatus(status)}</span>
                  <span className="tp-status-group-count">{tasks.length}</span>
                  <button
                    className="tp-icon-btn tp-status-group-add"
                    onClick={(e) => { e.stopPropagation(); onCreateTask?.(); }}
                    title="Add task"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  </button>
                </div>

                {/* Task Rows */}
                {!collapsedGroups.has(status) && tasks.map(task => (
                  <TaskRow
                    key={task._id}
                    task={task}
                    isSelected={selectedTaskIds.has(task._id)}
                    onToggleSelect={handleToggleSelect}
                    onPreview={detailPanelEnabled ? handlePreview : undefined}
                    anySelected={anySelected}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {detailPanelEnabled && previewTask && (
          <TaskDetailPanel
            task={previewTask}
            onClose={() => setPreviewTask(null)}
          />
        )}
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedIds={selectedTaskIds}
        onClearSelection={handleClearSelection}
        onActionComplete={handleBulkActionComplete}
      />
    </>
  );
}
