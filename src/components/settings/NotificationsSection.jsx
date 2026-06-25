import { useState } from 'react';

/**
 * NotificationsSection — notification preference toggles.
 */
export default function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    inAppNotifications: true,
    aiDigestEmails: true,
    taskAssignment: true,
    mentions: true,
    weeklyReport: false,
    slackIntegration: false,
  });

  const toggle = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const NOTIFICATION_SETTINGS = [
    {
      title: 'Email',
      items: [
        { key: 'emailNotifications', label: 'Email notifications', desc: 'Receive email notifications for important updates' },
        { key: 'aiDigestEmails', label: 'AI digest emails', desc: 'Weekly AI-generated summary of workspace activity' },
        { key: 'weeklyReport', label: 'Weekly report', desc: 'Receive a weekly productivity report via email' },
      ],
    },
    {
      title: 'In-app',
      items: [
        { key: 'inAppNotifications', label: 'In-app notifications', desc: 'Show notification badges and popups within TaskPulse' },
        { key: 'taskAssignment', label: 'Task assignment alerts', desc: 'Get notified when a task is assigned to you' },
        { key: 'mentions', label: 'Mention alerts', desc: 'Get notified when someone mentions you in a comment' },
      ],
    },
    {
      title: 'Integrations',
      items: [
        { key: 'slackIntegration', label: 'Slack notifications', desc: 'Forward notifications to your connected Slack channel' },
      ],
    },
  ];

  return (
    <>
      <h1 className="tp-settings-page-title">Notifications</h1>

      {NOTIFICATION_SETTINGS.map(section => (
        <div key={section.title} className="tp-settings-group">
          <h3 className="tp-settings-group-title">{section.title}</h3>
          {section.items.map(item => (
            <div key={item.key} className="tp-settings-row">
              <div className="tp-settings-row-info">
                <p className="tp-settings-row-label">{item.label}</p>
                <p className="tp-settings-row-desc">{item.desc}</p>
              </div>
              <div className="tp-settings-row-control">
                <button
                  className={`tp-toggle ${prefs[item.key] ? 'active' : ''}`}
                  onClick={() => toggle(item.key)}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
