import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../shared/Avatar';

/**
 * WorkspaceSection — workspace admin settings.
 * Shows workspace name, timezone, plan tier, members, and invite.
 */
export default function WorkspaceSection() {
  const { activeWorkspace } = useWorkspace();
  const { user } = useAuth();

  const ws = activeWorkspace;

  return (
    <>
      <h1 className="tp-settings-page-title">Workspace</h1>

      <div className="tp-settings-group">
        <h3 className="tp-settings-group-title">General</h3>

        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Workspace name</p>
            <p className="tp-settings-row-desc">The name of your workspace visible to all members</p>
          </div>
          <div className="tp-settings-row-control">
            <input
              className="tp-form-input"
              defaultValue={ws?.name || ''}
              style={{ width: 200 }}
            />
          </div>
        </div>

        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Workspace URL</p>
            <p className="tp-settings-row-desc">Used for sharing and API access</p>
          </div>
          <div className="tp-settings-row-control">
            <span style={{
              fontSize: 13, color: 'var(--tp-text-secondary)',
              padding: '6px 10px', background: 'var(--tp-surface)',
              borderRadius: 'var(--tp-radius)', border: '1px solid var(--tp-border)',
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}>
              taskpulse.app/{ws?.slug || 'workspace'}
            </span>
          </div>
        </div>

        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Timezone</p>
            <p className="tp-settings-row-desc">Default timezone for workspace-level features</p>
          </div>
          <div className="tp-settings-row-control">
            <select className="tp-form-input tp-form-select" style={{ width: 'auto', minWidth: 200 }}>
              <option>Asia/Kolkata (UTC+5:30)</option>
              <option>America/New_York (UTC-5)</option>
              <option>Europe/London (UTC+0)</option>
            </select>
          </div>
        </div>

        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Plan</p>
            <p className="tp-settings-row-desc">Your current subscription plan</p>
          </div>
          <div className="tp-settings-row-control">
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 'var(--tp-radius)',
              background: 'var(--tp-accent-muted)', color: 'var(--tp-accent)',
              fontSize: 12, fontWeight: 600,
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1l1.2 2.5 2.8.4-2 2 .5 2.8L6 7.5 3.5 8.7l.5-2.8-2-2 2.8-.4L6 1z" fill="currentColor"/>
              </svg>
              Pro
            </span>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="tp-settings-group" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 className="tp-settings-group-title" style={{ margin: 0 }}>Members</h3>
          <button className="tp-btn-primary tp-btn-sm">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M1 11c0-2 2-3 4-3s4 1 4 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <path d="M10 5v3M8.5 6.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Invite members
          </button>
        </div>

        <div style={{
          border: '1px solid var(--tp-border)',
          borderRadius: 'var(--tp-radius-lg)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 200px 100px',
            padding: '10px 16px', background: 'var(--tp-surface)',
            borderBottom: '1px solid var(--tp-border)',
            fontSize: 11, fontWeight: 600, color: 'var(--tp-text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span>Member</span>
            <span>Email</span>
            <span>Role</span>
          </div>

          {/* Owner row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 200px 100px',
            padding: '12px 16px', alignItems: 'center',
            fontSize: 13,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar name={user?.name || 'U'} size={28} />
              <div>
                <span style={{ fontWeight: 500, color: 'var(--tp-text)' }}>{user?.name || 'You'}</span>
                <span style={{ fontSize: 11, color: 'var(--tp-text-muted)', marginLeft: 6 }}>(You)</span>
              </div>
            </div>
            <span style={{ color: 'var(--tp-text-secondary)' }}>{user?.email || '—'}</span>
            <span style={{
              display: 'inline-flex', padding: '2px 8px', borderRadius: 4,
              background: 'var(--tp-accent)', color: '#fff',
              fontSize: 11, fontWeight: 600, width: 'fit-content',
            }}>Owner</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="tp-settings-group" style={{ marginTop: 32 }}>
        <h3 className="tp-settings-group-title" style={{ color: 'var(--tp-error)' }}>Danger zone</h3>
        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Archive workspace</p>
            <p className="tp-settings-row-desc">Archive this workspace and all its data. This will make it read-only.</p>
          </div>
          <div className="tp-settings-row-control">
            <button className="tp-btn-danger">Archive workspace</button>
          </div>
        </div>
      </div>
    </>
  );
}
