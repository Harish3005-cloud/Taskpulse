import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import Avatar from '../shared/Avatar';
import api from '../../api/client';

/* ── Icon Components ─────────────────────────────────────────────────── */
const Icons = {
  Inbox: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 10h3.5a1 1 0 011 1v0a1.5 1.5 0 003 0v0a1 1 0 011-1H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/></svg>
  ),
  Reviews: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M4 5h8M4 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  ),
  MyIssues: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 5v3l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Projects: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7h6M5 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  ),
  Views: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  ),
  More: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>
  ),
  Issues: () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.3"/></svg>
  ),
  Analytics: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 13V8M7 13V5M11 13V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
  AI: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
  ),
  Chevron: () => (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 1l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  ),
  Help: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M6 6.5a2 2 0 013.5 1.3c0 1.2-1.5 1.2-1.5 1.2M8 11.5v.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  ),
  InvitePeople: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 13c0-2.5 2.5-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M12 5v4M10 7h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
  ),
};

const TEAM_COLORS = [
  'linear-gradient(135deg, #ef4444, #f97316)',
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #22c55e, #10b981)',
  'linear-gradient(135deg, #f59e0b, #eab308)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
];

export default function Sidebar({ onCreateTask, onCreateWorkspace, onCreateProject, onCreateView }) {
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, setActiveWorkspace, unreadCount, sidebarCollapsed, toggleSidebar } = useWorkspace();
  const { open: openCommandPalette } = useCommandPalette();
  const [expandedSections, setExpandedSections] = useState({ workspace: true, projects: true, views: true, teams: true, try: true });
  const [expandedTeams, setExpandedTeams] = useState(() => new Set([activeWorkspace?._id]));

  const [projects, setProjects] = useState([]);
  const [views, setViews] = useState([]);

  useEffect(() => {
    if (!activeWorkspace) return;

    const fetchWorkspaceData = async () => {
      try {
        const [projRes, viewsRes] = await Promise.all([
          api.get(`/projects?workspaceId=${activeWorkspace._id}`),
          api.get(`/views?workspaceId=${activeWorkspace._id}`)
        ]);
        setProjects(projRes.data.projects || []);
        setViews(viewsRes.data.views || []);
      } catch (err) {
        console.error('Failed to fetch sidebar data', err);
      }
    };

    fetchWorkspaceData();
  }, [activeWorkspace]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleTeam = (teamId) => {
    setExpandedTeams(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  return (
    <aside className={`tp-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      {/* ── Header ──────────────────────────── */}
      <div className="tp-sidebar-header">
        <button className="tp-sidebar-workspace-btn" onClick={() => navigate('/dashboard')}>
          <Avatar name={activeWorkspace?.name || 'T'} size={20} />
          <span>{activeWorkspace?.name?.split(' ')[0] || 'TaskPulse'}</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
        </button>
        <div className="tp-sidebar-header-actions">
          <button className="tp-sidebar-icon-btn" title="Toggle Sidebar" onClick={toggleSidebar}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
          <button className="tp-sidebar-icon-btn" title="Search (Ctrl+K)" onClick={() => openCommandPalette()}>
            <Icons.Search />
          </button>
          <button className="tp-sidebar-icon-btn" title="Create task" onClick={onCreateTask}>
            <Icons.Plus />
          </button>
        </div>
      </div>

      {/* ── Scrollable Area ─────────────────── */}
      <div className="tp-sidebar-scroll">
        {/* Primary Nav */}
        <nav className="tp-sidebar-nav">
          <NavLink to="/dashboard/command-center" className={({ isActive }) => `tp-sidebar-item ${isActive ? 'active' : ''}`}>
            <span className="tp-sidebar-item-icon"><Icons.Projects /></span>
            Dashboard
          </NavLink>
          <NavLink to="/dashboard/inbox" className={({ isActive }) => `tp-sidebar-item ${isActive ? 'active' : ''}`}>
            <span className="tp-sidebar-item-icon"><Icons.Inbox /></span>
            Inbox
            {unreadCount > 0 && <span className="tp-badge unread">{unreadCount}</span>}
          </NavLink>
        </nav>

        {/* Your Teams Section */}
        <div className="tp-sidebar-section" onClick={() => toggleSection('teams')}>
          Your teams
          <span className={`tp-sidebar-section-arrow ${!expandedSections.teams ? 'collapsed' : ''}`}>▾</span>
        </div>
        {expandedSections.teams && (
          <nav className="tp-sidebar-nav">
            {workspaces.map((ws, i) => (
              <div key={ws._id}>
                <div
                  className={`tp-team-item ${activeWorkspace?._id === ws._id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    toggleTeam(ws._id);
                  }}
                >
                  <div className="tp-team-dot" style={{ background: TEAM_COLORS[i % TEAM_COLORS.length] }}>
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{ws.name}</span>
                  <span className={`tp-sidebar-section-arrow ${!expandedTeams.has(ws._id) ? 'collapsed' : ''}`} style={{marginLeft: 'auto'}}>▾</span>
                </div>
                {expandedTeams.has(ws._id) && (
                  <div className="tp-sidebar-subnav" style={{ paddingLeft: '24px', paddingBottom: '8px' }}>
                    <NavLink to={`/dashboard/${ws.slug || ws._id}/projects`} className={({ isActive }) => `tp-sidebar-item ${isActive ? 'active' : ''}`}>
                      <span className="tp-sidebar-item-icon"><Icons.Projects /></span>
                      Projects
                    </NavLink>
                    <NavLink to={`/dashboard/${ws.slug || ws._id}/tasks`} className={({ isActive }) => `tp-sidebar-item ${isActive ? 'active' : ''}`}>
                      <span className="tp-sidebar-item-icon"><Icons.Issues /></span>
                      Tasks
                    </NavLink>
                    <NavLink to={`/dashboard/${ws.slug || ws._id}/views`} className={({ isActive }) => `tp-sidebar-item ${isActive ? 'active' : ''}`}>
                      <span className="tp-sidebar-item-icon"><Icons.Views /></span>
                      Views
                    </NavLink>
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}
        {/* Secondary Nav */}
        <nav className="tp-sidebar-nav" style={{ marginTop: '16px' }}>
          <NavLink to="/dashboard/analytics" className={({ isActive }) => `tp-sidebar-item ${isActive ? 'active' : ''}`}>
            <span className="tp-sidebar-item-icon"><Icons.Analytics /></span>
            Analytics
          </NavLink>
          <NavLink to="/dashboard/ai" className={({ isActive }) => `tp-sidebar-item ${isActive ? 'active' : ''}`}>
            <span className="tp-sidebar-item-icon"><Icons.AI /></span>
            AI Assistant
          </NavLink>
          <NavLink to="/dashboard/activity" className={({ isActive }) => `tp-sidebar-item ${isActive ? 'active' : ''}`}>
            <span className="tp-sidebar-item-icon"><Icons.Issues /></span>
            Activity
          </NavLink>
        </nav>
      </div>

      {/* ── Footer ──────────────────────────── */}
      <div className="tp-sidebar-footer">
        <nav className="tp-sidebar-nav">
          <NavLink to="/dashboard/settings" className={({ isActive }) => `tp-sidebar-item ${isActive ? 'active' : ''}`}>
            <span className="tp-sidebar-item-icon"><Icons.Settings /></span>
            Settings
          </NavLink>
          <div className="tp-sidebar-item" style={{ marginTop: 2 }}>
            <span className="tp-sidebar-item-icon"><Icons.Help /></span>
            Help
          </div>
        </nav>
      </div>
    </aside>
  );
}
