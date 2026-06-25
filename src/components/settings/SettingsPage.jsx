import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileSection from './ProfileSection';
import NotificationsSection from './NotificationsSection';
import WorkspaceSection from './WorkspaceSection';
import BillingSection from './BillingSection';

/**
 * SettingsPage — settings layout matching Linear's settings structure.
 * Sidebar items are clickable to switch between sub-pages.
 */
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('preferences');

  const settingsSections = [
    {
      title: 'Personal',
      items: [
        { key: 'preferences', label: 'Preferences', icon: '⚙️' },
        { key: 'profile', label: 'Profile', icon: '👤' },
        { key: 'notifications', label: 'Notifications', icon: '🔔' },
      ],
    },
    {
      title: 'Issues',
      items: [
        { key: 'labels', label: 'Labels', icon: '🏷️' },
        { key: 'templates', label: 'Templates', icon: '📋' },
      ],
    },
    {
      title: 'Features',
      items: [
        { key: 'ai', label: 'AI & Agents', icon: '✨' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { key: 'workspace', label: 'Workspace', icon: '🏢' },
        { key: 'members', label: 'Members', icon: '👥' },
        { key: 'billing', label: 'Billing', icon: '💳' },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'workspace':
        return <WorkspaceSection />;
      case 'billing':
        return <BillingSection />;
      default:
        return <PreferencesContent />;
    }
  };

  return (
    <>
      <div className="tp-settings-shell">
        {/* Settings Sidebar */}
        <div className="tp-settings-sidebar">
          <Link to="/dashboard/inbox" className="tp-settings-back">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            Back to app
          </Link>
          <input className="tp-settings-search" placeholder="Search..." />
          {settingsSections.map(section => (
            <div key={section.title}>
              <div className="tp-settings-section-label">{section.title}</div>
              {section.items.map(item => (
                <div
                  key={item.key}
                  className={`tp-settings-item ${activeSection === item.key ? 'active' : ''}`}
                  onClick={() => setActiveSection(item.key)}
                >
                  <span className="tp-settings-item-icon">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Settings Content */}
        <div className="tp-settings-content">
          {renderContent()}
        </div>
      </div>
    </>
  );
}

/**
 * PreferencesContent — the default preferences sub-page (extracted from original).
 */
function PreferencesContent() {
  return (
    <>
      <h1 className="tp-settings-page-title">Preferences</h1>

      <div className="tp-settings-group">
        <h3 className="tp-settings-group-title">General</h3>

        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Default home view</p>
            <p className="tp-settings-row-desc">Select which view to display when launching TaskPulse</p>
          </div>
          <div className="tp-settings-row-control">
            <select className="tp-form-input tp-form-select" style={{ width: 'auto', minWidth: 140 }}>
              <option>Active tasks</option>
              <option>My tasks</option>
              <option>Inbox</option>
            </select>
          </div>
        </div>

        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Display names</p>
            <p className="tp-settings-row-desc">Select how names are displayed in the interface</p>
          </div>
          <div className="tp-settings-row-control">
            <select className="tp-form-input tp-form-select" style={{ width: 'auto', minWidth: 140 }}>
              <option>Full name</option>
              <option>First name</option>
              <option>Username</option>
            </select>
          </div>
        </div>

        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Enable AI task scoring</p>
            <p className="tp-settings-row-desc">Automatically analyze and score new tasks using AI</p>
          </div>
          <div className="tp-settings-row-control">
            <button className="tp-toggle active" />
          </div>
        </div>
      </div>

      <div className="tp-settings-group">
        <h3 className="tp-settings-group-title">Interface and theme</h3>

        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Interface theme</p>
            <p className="tp-settings-row-desc">Select your interface color scheme</p>
          </div>
          <div className="tp-settings-row-control">
            <select className="tp-form-input tp-form-select" style={{ width: 'auto', minWidth: 140 }}>
              <option>Dark</option>
              <option>System preference</option>
            </select>
          </div>
        </div>

        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">Font size</p>
            <p className="tp-settings-row-desc">Adjust the size of text across the app</p>
          </div>
          <div className="tp-settings-row-control">
            <select className="tp-form-input tp-form-select" style={{ width: 'auto', minWidth: 140 }}>
              <option>Default</option>
              <option>Small</option>
              <option>Large</option>
            </select>
          </div>
        </div>

        <div className="tp-settings-row">
          <div className="tp-settings-row-info">
            <p className="tp-settings-row-label">AI Weekly Digest</p>
            <p className="tp-settings-row-desc">Receive AI-generated weekly summaries of your workspace activity</p>
          </div>
          <div className="tp-settings-row-control">
            <button className="tp-toggle active" />
          </div>
        </div>
      </div>
    </>
  );
}
