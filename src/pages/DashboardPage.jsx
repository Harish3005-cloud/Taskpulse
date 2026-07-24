import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creating, setCreating] = useState(false);
  const [activeWs, setActiveWs] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/workspaces');
      setWorkspaces(data.workspaces);
    } catch (_e) {
      setError('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchWorkspaces();
  }, [isAuthenticated, navigate, fetchWorkspaces]);

  useEffect(() => {
    if (workspaces.length > 0 && !activeWs) {
      setActiveWs(workspaces[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    
    setCreating(true);
    try {
      const { data } = await api.post('/workspaces', { name: newWorkspaceName });
      setWorkspaces(prev => [data.workspace, ...prev]);
      setActiveWs(data.workspace);
      setNewWorkspaceName('');
      setShowCreate(false);
    } catch (_e) {
      setError('Failed to create workspace');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };


  const getWsColor = (index) => {
    const colors = [
      'linear-gradient(135deg, #ef4444, #f97316)',
      'linear-gradient(135deg, #5e6ad2, #8b5cf6)',
      'linear-gradient(135deg, #22c55e, #10b981)',
      'linear-gradient(135deg, #f59e0b, #eab308)',
      'linear-gradient(135deg, #ec4899, #f43f5e)',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="dashboard-shell">
      
      {/* ─── Left Sidebar ─────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-user" onClick={() => navigate('/')}>
            <div className="sidebar-user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span>{user?.name?.split(' ')[0] || 'User'}</span>
          </div>
          <div className="sidebar-actions">
            <button className="sidebar-action-btn" title="Search">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <button className="sidebar-action-btn" title="Create" onClick={() => setShowCreate(true)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-item">
            <span className="sidebar-item-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/></svg>
            </span>
            Inbox
            {workspaces.length > 0 && <span className="badge">{workspaces.length}</span>}
          </div>
          <div className="sidebar-item">
            <span className="sidebar-item-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M4 5h8M4 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </span>
            My Issues
          </div>
        </nav>

        <div className="sidebar-section">
          Workspace
          <span className="sidebar-section-arrow">▾</span>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-item" onClick={() => setActiveTab('overview')}>
            <span className="sidebar-item-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7h6M5 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </span>
            Projects
          </div>
          <div className="sidebar-item">
            <span className="sidebar-item-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </span>
            Views
          </div>
          <div className="sidebar-item">
            <span className="sidebar-item-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="4" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>
            </span>
            More
          </div>
        </nav>

        <div className="sidebar-section">
          Your teams
          <span className="sidebar-section-arrow">▾</span>
        </div>
        <nav className="sidebar-nav">
          {workspaces.map((ws, i) => (
            <div key={ws._id}>
              <div 
                className={`sidebar-ws-item ${activeWs?._id === ws._id ? 'active' : ''}`}
                onClick={() => { setActiveWs(ws); setActiveTab('overview'); }}
              >
                <div className="sidebar-ws-dot" style={{ background: getWsColor(i) }}>
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <span>{ws.name}</span>
              </div>
              {activeWs?._id === ws._id && (
                <>
                  <div className="sidebar-ws-sub">
                    <span className="sidebar-ws-sub-icon">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/></svg>
                    </span>
                    Issues
                  </div>
                  <div className="sidebar-ws-sub">
                    <span className="sidebar-ws-sub-icon">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/></svg>
                    </span>
                    Projects
                  </div>
                  <div className="sidebar-ws-sub">
                    <span className="sidebar-ws-sub-icon">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M3 5h10M3 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </span>
                    Views
                  </div>
                </>
              )}
            </div>
          ))}
          {workspaces.length === 0 && !loading && (
            <div className="sidebar-item" onClick={() => setShowCreate(true)} style={{ color: 'var(--lin-text-muted)' }}>
              <span className="sidebar-item-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </span>
              Create workspace
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-section" style={{ padding: '4px 8px' }}>Try</div>
          <nav className="sidebar-nav">
            <div className="sidebar-item" onClick={() => setShowCreate(true)}>
              <span className="sidebar-item-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </span>
              New workspace
            </div>
            <div className="sidebar-item" onClick={handleLogout}>
              <span className="sidebar-item-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2H4a2 2 0 00-2 2v8a2 2 0 002 2h2M10 11l3-3-3-3M6 8h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              Log out
            </div>
          </nav>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <div className="main-content">
        
        {/* Top Bar */}
        <div className="main-topbar">
          <div className="main-topbar-left">
            {activeWs && (
              <>
                <div className="topbar-ws-icon" style={{ background: getWsColor(workspaces.indexOf(activeWs)) }}>
                  {activeWs.name.charAt(0).toUpperCase()}
                </div>
                <span className="topbar-ws-name">{activeWs.name}</span>
                <button className="topbar-action-btn">⭐</button>
                <button className="topbar-action-btn">···</button>
              </>
            )}
            {!activeWs && !loading && (
              <span className="topbar-ws-name">Dashboard</span>
            )}
          </div>
          <div className="topbar-actions">
            <button className="topbar-action-btn" title="Link">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5l3-3M7 11l-1.5 1.5a2.12 2.12 0 01-3-3L4 8m5-2l1.5-1.5a2.12 2.12 0 013 3L12 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="main-tabs">
          <button 
            className={`main-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`main-tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          <button 
            className={`main-tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Members
          </button>

          <div className="main-tab-right">
            <button className="add-resources-btn" onClick={() => setShowCreate(true)}>
              + Add resources
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: '12px 24px' }}>
            <div className="dashboard-error animate-fade-in">
              <span>{error}</span>
              <button onClick={() => setError('')}>✕</button>
            </div>
          </div>
        )}

        {/* Main Body */}
        <div className="main-body">
          {activeWs ? (
            <>
              <div className="main-body-content">
                {/* Workspace Header */}
                <div className="ws-header">
                  <div className="ws-header-icon" style={{ background: getWsColor(workspaces.indexOf(activeWs)) }}>
                    {activeWs.name.charAt(0).toUpperCase()}
                  </div>
                  <h1 className="ws-header-name">{activeWs.name}</h1>
                </div>
                <p className="ws-description">Add a description...</p>

                {/* Pinned Resources */}
                <div className="pinned-section-header">
                  <h2 className="pinned-title">Pinned resources</h2>
                  <div className="pinned-actions">
                    <button className="pinned-action-btn" onClick={() => setShowCreate(true)}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </button>
                    <button className="pinned-action-btn">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h10M3 8h10M3 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </button>
                  </div>
                </div>
                <p className="pinned-desc">
                  Add documents and links. Organize by creating sections.
                </p>
              </div>

              {/* Right Sidebar */}
              <div className="main-body-sidebar">
                <h3 className="right-section-title">Members</h3>
                <div className="right-members">
                  <div className="member-avatar" style={{ background: getWsColor(workspaces.indexOf(activeWs)) }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>

                <h3 className="right-section-title">Go to</h3>
                <div className="right-links">
                  <div className="right-link">
                    <span className="right-link-icon">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M6 8h4M8 6v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </span>
                    Team settings
                  </div>
                  <div className="right-link">
                    <span className="right-link-icon">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/></svg>
                    </span>
                    Issues
                  </div>
                  <div className="right-link">
                    <span className="right-link-icon">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/></svg>
                    </span>
                    Projects
                  </div>
                  <div className="right-link">
                    <span className="right-link-icon">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M3 5h10M3 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                    </span>
                    Views
                  </div>
                </div>
              </div>
            </>
          ) : loading ? (
            <div className="main-body-content">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ width: '200px', height: '28px', background: '#1a1a1a', borderRadius: '6px', animation: 'fadeIn 1s infinite alternate' }}></div>
                <div style={{ width: '300px', height: '16px', background: '#141414', borderRadius: '4px', animation: 'fadeIn 1s infinite alternate', animationDelay: '0.2s' }}></div>
                <div style={{ width: '250px', height: '16px', background: '#141414', borderRadius: '4px', animation: 'fadeIn 1s infinite alternate', animationDelay: '0.4s' }}></div>
              </div>
            </div>
          ) : (
            <div className="main-body-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏗️</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 6px 0' }}>No workspaces yet</h3>
              <p style={{ fontSize: '14px', color: 'var(--lin-text-muted)', margin: '0 0 20px 0' }}>Create your first workspace to start managing tasks with AI.</p>
              <button className="modal-btn modal-btn-primary" onClick={() => setShowCreate(true)}>
                Create Workspace
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Create Workspace Modal ─────────────────────────────── */}
      {showCreate && (
        <div className="modal-overlay animate-fade-in" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Create New Workspace</h2>
            <p className="modal-desc">A workspace is where your team organizes and manages tasks.</p>
            <form onSubmit={handleCreateWorkspace} className="modal-form">
              <div>
                <label className="form-label" htmlFor="workspace-name">Workspace Name</label>
                <input
                  id="workspace-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Product Team, Marketing"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-btn modal-btn-cancel" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn modal-btn-primary" disabled={creating} id="submit-workspace-btn">
                  {creating ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
