import { useAuth } from '../../context/AuthContext';
import Avatar from '../shared/Avatar';

/**
 * ProfileSection — user profile settings.
 * Shows avatar, name, email, edit form, and delete account danger zone.
 */
export default function ProfileSection() {
  const { user } = useAuth();

  return (
    <>
      <h1 className="tp-settings-page-title">Profile</h1>

      <div className="tp-settings-group">
        <h3 className="tp-settings-group-title">Your profile</h3>

        {/* Avatar + Name display */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '16px 0', borderBottom: '1px solid var(--tp-border-subtle)',
          marginBottom: 16,
        }}>
          <div style={{ position: 'relative' }}>
            <Avatar name={user?.name || 'U'} size={64} />
            <button
              className="tp-icon-btn"
              style={{
                position: 'absolute', bottom: -4, right: -4,
                width: 24, height: 24,
                background: 'var(--tp-surface-raised)',
                border: '1px solid var(--tp-border)',
                borderRadius: '50%',
              }}
              title="Change avatar"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5l2 2-6 6H2.5v-2l6-6z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--tp-text)' }}>
              {user?.name || 'User'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--tp-text-muted)', margin: '4px 0 0 0' }}>
              {user?.email || 'No email'}
            </p>
            <p style={{ fontSize: 12, color: 'var(--tp-text-dim)', margin: '4px 0 0 0' }}>
              Member since {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                : 'recently'
              }
            </p>
          </div>
        </div>

        {/* Edit form */}
        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Full name</p>
            <p className="tp-settings-row-desc">Your full name as displayed to other members</p>
          </div>
          <div className="tp-settings-row-control">
            <input
              className="tp-form-input"
              defaultValue={user?.name || ''}
              style={{ width: 200 }}
            />
          </div>
        </div>

        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Display name</p>
            <p className="tp-settings-row-desc">A shorter name for mentions and compact views</p>
          </div>
          <div className="tp-settings-row-control">
            <input
              className="tp-form-input"
              defaultValue={user?.name?.split(' ')[0] || ''}
              style={{ width: 200 }}
            />
          </div>
        </div>

        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Timezone</p>
            <p className="tp-settings-row-desc">Used for scheduling and date display</p>
          </div>
          <div className="tp-settings-row-control">
            <select className="tp-form-input tp-form-select" style={{ width: 'auto', minWidth: 200 }}>
              <option>Asia/Kolkata (UTC+5:30)</option>
              <option>America/New_York (UTC-5)</option>
              <option>America/Los_Angeles (UTC-8)</option>
              <option>Europe/London (UTC+0)</option>
              <option>Europe/Berlin (UTC+1)</option>
              <option>Asia/Tokyo (UTC+9)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="tp-settings-group" style={{ marginTop: 32 }}>
        <h3 className="tp-settings-group-title" style={{ color: 'var(--tp-error)' }}>Danger zone</h3>
        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Delete account</p>
            <p className="tp-settings-row-desc">Permanently delete your account and all associated data. This action cannot be undone.</p>
          </div>
          <div className="tp-settings-row-control">
            <button className="tp-btn-danger">Delete account</button>
          </div>
        </div>
      </div>
    </>
  );
}
