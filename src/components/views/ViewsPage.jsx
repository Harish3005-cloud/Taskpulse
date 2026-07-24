import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import FilterBar from '../shared/FilterBar';
import EmptyState from '../shared/EmptyState';
import CreateViewModal from './CreateViewModal';
import Avatar from '../shared/Avatar';
import api from '../../api/client';

const VIEW_TABS = [
  { key: 'member-workload', label: 'Member Workload' },
  { key: 'assigned-tasks', label: 'Assigned Tasks' },
  { key: 'progress-tracking', label: 'Progress Tracking' },
];

/**
 * ViewsPage — saved custom views list matching Linear's Views page.
 */
export default function ViewsPage() {
  const { teamSlug } = useParams();
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, setActiveWorkspace, savedViews = [], deleteView: _deleteView } = useWorkspace();
  const [activeTab, setActiveTab] = useState('member-workload');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teamSlug) {
      const ws = workspaces.find(w => w.slug === teamSlug || w._id === teamSlug);
      if (ws && ws._id !== activeWorkspace?._id) {
        setActiveWorkspace(ws);
      }
    }
  }, [teamSlug, workspaces, activeWorkspace, setActiveWorkspace]);

  useEffect(() => {
    if (activeWorkspace?._id) {
      setLoading(true);
      // Fetch all tasks for workload calculation. In a real app, you might want a specific aggregation API endpoint.
      api.get(`/tasks?workspaceId=${activeWorkspace._id}&limit=1000`)
        .then(res => {
          setTasks(res.data.tasks || []);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [activeWorkspace]);

  const memberStats = useMemo(() => {
    const stats = {};
    (activeWorkspace?.members || []).forEach(m => {
      const id = m.user?._id || m.userId?._id || m.userId || m._id;
      stats[id] = { total: 0, done: 0, pending: 0, member: m };
    });

    tasks.forEach(t => {
      const assigneeId = t.assignedTo?._id || t.assignedTo;
      if (assigneeId && stats[assigneeId]) {
        stats[assigneeId].total += 1;
        if (t.status === 'done') stats[assigneeId].done += 1;
        else stats[assigneeId].pending += 1;
      }
    });

    return Object.values(stats);
  }, [tasks, activeWorkspace]);

  const _filteredViews = savedViews.filter(v =>
    activeTab === 'issues' ? v.type !== 'projects' : v.type === 'projects'
  );

  const _formatFilters = (view) => {
    const parts = [];
    if (view.filters?.status?.length) parts.push(`Status: ${view.filters.status.join(', ')}`);
    if (view.filters?.priority?.length) parts.push(`Priority: ${view.filters.priority.join(', ')}`);
    if (view.filters?.assignee) parts.push(`Assignee: ${view.filters.assignee}`);
    if (view.sortBy) parts.push(`Sort: ${view.sortBy}`);
    return parts.join(' · ') || 'No filters';
  };

  return (
    <>
      {/* Top Bar */}
      <div className="tp-topbar">
        <div className="tp-topbar-left">
          <span className="tp-topbar-title">Views</span>
        </div>
        <div className="tp-topbar-right">
          <button
            className="tp-btn-primary tp-btn-sm"
            onClick={() => setShowCreateModal(true)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            New view
          </button>
        </div>
      </div>

      {/* Tab Filters */}
      <div style={{ borderBottom: '1px solid var(--tp-border-subtle)' }}>
        <FilterBar
          tabs={VIEW_TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Views Content */}
      <div className="flex-1 p-8 bg-[var(--tp-bg)] overflow-auto">
        {activeTab === 'member-workload' ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[var(--tp-text)]">Member Workload</h2>
              <p className="text-sm text-[var(--tp-text-muted)]">Monitor tasks and progress across the team</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full text-center text-[var(--tp-text-muted)] py-12">Loading workload data...</div>
              ) : memberStats.map((stat, idx) => {
                const { member, total, done, pending } = stat;
                const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                const name = member.name || member.user?.name || member.userId?.name || 'Team Member';
                
                return (
                  <div key={idx} className="bg-[var(--tp-surface)] border border-[var(--tp-border-subtle)] rounded-xl p-5 hover:border-[var(--tp-border)] transition-colors cursor-pointer">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar name={name} size={40} />
                      <div>
                        <h3 className="font-semibold text-[var(--tp-text)]">{name}</h3>
                        <p className="text-xs text-[var(--tp-text-muted)]">{member.role || 'Member'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-[var(--tp-bg)] rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-[var(--tp-text)]">{total}</div>
                        <div className="text-[10px] uppercase tracking-wider text-[var(--tp-text-muted)] mt-1">Assigned</div>
                      </div>
                      <div className="bg-[var(--tp-bg)] rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-green-500">{done}</div>
                        <div className="text-[10px] uppercase tracking-wider text-[var(--tp-text-muted)] mt-1">Done</div>
                      </div>
                      <div className="bg-[var(--tp-bg)] rounded-lg p-3 text-center">
                        <div className="text-xl font-bold text-yellow-500">{pending}</div>
                        <div className="text-[10px] uppercase tracking-wider text-[var(--tp-text-muted)] mt-1">Pending</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-1 text-[var(--tp-text-muted)]">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-[var(--tp-border-subtle)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-[var(--tp-border-subtle)]">
                      <button 
                        onClick={() => navigate(`/${activeWorkspace?.slug || activeWorkspace?._id}/board`)}
                        className="text-sm font-medium text-[var(--tp-accent)] hover:opacity-80 w-full text-center"
                      >
                        View Tasks
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {!loading && (activeWorkspace?.members?.length || 0) === 0 && (
                <div className="col-span-full">
                  <EmptyState 
                    title="No members found" 
                    description="Invite members to this workspace to view their workload." 
                    actionLabel="Invite Members" 
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            title={`${VIEW_TABS.find(t => t.key === activeTab)?.label} Views`}
            description={`Create and manage your ${activeTab.replace('-', ' ')} views here.`}
            actionLabel="Create new view"
            onAction={() => setShowCreateModal(true)}
          />
        )}
      </div>

      {/* Create View Modal */}
      {showCreateModal && (
        <CreateViewModal
          type={activeTab === 'projects' ? 'projects' : 'issues'}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </>
  );
}
