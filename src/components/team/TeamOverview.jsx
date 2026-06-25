import { useState } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../shared/Avatar';
import EmptyState from '../shared/EmptyState';

const TEAM_COLORS = [
  'linear-gradient(135deg, #ef4444, #f97316)',
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #22c55e, #10b981)',
  'linear-gradient(135deg, #f59e0b, #eab308)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
];

/**
 * TeamOverview — team hub page with Overview/Documents/Members tabs.
 * Matches Linear's team overview layout.
 */
export default function TeamOverview() {
  const { teamSlug } = useParams();
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Find workspace by slug or name
  const workspace = workspaces.find(ws => ws.slug === teamSlug || ws.name?.toLowerCase().replace(/\s+/g, '-') === teamSlug) || activeWorkspace;

  // Set as active workspace if different
  if (workspace && workspace._id !== activeWorkspace?._id) {
    setActiveWorkspace(workspace);
  }

  const wsIndex = workspaces.findIndex(ws => ws._id === workspace?._id);
  const wsColor = TEAM_COLORS[wsIndex % TEAM_COLORS.length];
  const wsSlug = teamSlug;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'documents', label: 'Documents' },
    { key: 'members', label: 'Members' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="tp-topbar">
        <div className="tp-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 20, height: 20, borderRadius: 5,
            background: wsColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: '#fff',
          }}>
            {workspace?.name?.charAt(0)?.toUpperCase()}
          </div>
          <span className="tp-topbar-title">{workspace?.name || 'Workspace'}</span>
          <button className="tp-icon-btn" title="Favorite">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><polygon points="7,1 9,5 13,5.5 10,8.5 10.8,12.5 7,10.5 3.2,12.5 4,8.5 1,5.5 5,5" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>
          </button>
          <button className="tp-icon-btn" title="More options">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="3" cy="7" r="1" fill="currentColor"/><circle cx="7" cy="7" r="1" fill="currentColor"/><circle cx="11" cy="7" r="1" fill="currentColor"/></svg>
          </button>
        </div>
        <div className="tp-topbar-right">
          <button className="tp-icon-btn" title="Link">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 9.5l3-3M7 11l-1.5 1.5a2.12 2.12 0 01-3-3L4 8m5-2l1.5-1.5a2.12 2.12 0 013 3L12 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, borderBottom: '1px solid var(--tp-border-subtle)', padding: '0 16px' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 500,
              color: activeTab === tab.key ? 'var(--tp-text)' : 'var(--tp-text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid var(--tp-accent)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="tp-icon-btn" title="Add resources" style={{ fontSize: 13, color: 'var(--tp-text-muted)' }}>
          + Add resources
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex' }}>

        {activeTab === 'overview' && (
          <>
            {/* Main content */}
            <div style={{ flex: 1, padding: '32px 40px', maxWidth: 720 }}>
              {/* Team Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: wsColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700, color: '#fff',
                }}>
                  {workspace?.name?.charAt(0)?.toUpperCase()}
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--tp-text)' }}>
                  {workspace?.name}
                </h1>
              </div>
              <p style={{ fontSize: 14, color: 'var(--tp-text-muted)', margin: '0 0 32px 0', cursor: 'text' }}>
                Add a description...
              </p>

              {/* Pinned Resources */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, color: 'var(--tp-text)' }}>Pinned resources</h2>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="tp-icon-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  </button>
                  <button className="tp-icon-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 5h10M3 8h10M3 11h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--tp-text-muted)', margin: 0 }}>
                Add documents and links. Organize by creating sections.
              </p>
            </div>

            {/* Right sidebar */}
            <div style={{ width: 240, padding: '32px 24px', borderLeft: '1px solid var(--tp-border-subtle)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--tp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0' }}>Members</h3>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
                <Avatar name={user?.name || 'U'} size={32} />
                {workspace?.members?.slice(1).map((m, i) => (
                  <Avatar key={i} name={m.name || 'M'} size={32} />
                ))}
              </div>

              <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--tp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0' }}>Go to</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { label: 'Team settings', icon: '⚙️', to: `/dashboard/settings` },
                  { label: 'Issues', icon: '◎', to: `/dashboard/${wsSlug}/tasks` },
                  { label: 'Projects', icon: '⊕', to: `/dashboard/${wsSlug}/projects` },
                  { label: 'Views', icon: '◎', to: `/dashboard/${wsSlug}/views` },
                ].map(link => (
                  <div
                    key={link.label}
                    onClick={() => navigate(link.to)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 8px', borderRadius: 6,
                      fontSize: 13, color: 'var(--tp-text-secondary)',
                      cursor: 'pointer', transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--tp-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ width: 16, textAlign: 'center', fontSize: 12 }}>{link.icon}</span>
                    {link.label}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'documents' && (
          <div style={{ flex: 1 }}>
            <EmptyState
              icon={<svg width="56" height="56" viewBox="0 0 56 56" fill="none"><rect x="12" y="12" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5"/><path d="M20 22h16M20 28h12M20 34h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>}
              title="No documents yet"
              description="Add documents and links to keep your team's important resources in one place."
              actionLabel="Add document"
            />
          </div>
        )}

        {activeTab === 'members' && (
          <div style={{ flex: 1, padding: '24px 32px' }}>
            <div style={{
              border: '1px solid var(--tp-border)',
              borderRadius: 'var(--tp-radius-lg)',
              overflow: 'hidden',
            }}>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 200px 120px 120px',
                padding: '10px 16px', background: 'var(--tp-surface)',
                borderBottom: '1px solid var(--tp-border)',
                fontSize: 11, fontWeight: 600, color: 'var(--tp-text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                <span>Joined</span>
              </div>

              {/* Current user row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 200px 120px 120px',
                padding: '12px 16px', alignItems: 'center',
                borderBottom: '1px solid var(--tp-border-subtle)',
                fontSize: 13,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={user?.name || 'U'} size={28} />
                  <span style={{ fontWeight: 500, color: 'var(--tp-text)' }}>{user?.name || 'You'}</span>
                </div>
                <span style={{ color: 'var(--tp-text-secondary)' }}>{user?.email || '—'}</span>
                <span style={{
                  display: 'inline-flex', padding: '2px 8px', borderRadius: 4,
                  background: 'var(--tp-accent)', color: '#fff',
                  fontSize: 11, fontWeight: 600, width: 'fit-content',
                }}>Owner</span>
                <span style={{ color: 'var(--tp-text-muted)', fontSize: 12 }}>
                  {workspace?.createdAt ? new Date(workspace.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
