import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import EmptyState from '../shared/EmptyState';
import { CheckCircle2, User, MessageSquare, AlertCircle, Bell, ArrowRight, LayoutDashboard } from 'lucide-react';

const NOTIF_ICONS = {
  task_assigned: <User size={16} />,
  task_updated: <CheckCircle2 size={16} />,
  task_mention: <Bell size={16} />,
  project_mention: <LayoutDashboard size={16} />,
  comment: <MessageSquare size={16} />,
  comment_mention: <MessageSquare size={16} />,
  system: <AlertCircle size={16} />
};

export default function Inbox() {
  const { notifications, markNotificationRead, markAllNotificationsRead, activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins || 1}m`;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours}h`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDayGroup = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (d.toDateString() === now.toDateString()) return 'Today';
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

    if (diffDays < 7) return 'Earlier This Week';
    return 'Older';
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filter === 'unread') return !n.read;
      if (filter === 'mentions') return n.type.includes('mention');
      if (filter === 'assignments') return n.type === 'task_assigned';
      return true;
    });
  }, [notifications, filter]);

  const groupedNotifications = useMemo(() => {
    const groups = {
      'Today': [],
      'Yesterday': [],
      'Earlier This Week': [],
      'Older': []
    };

    filteredNotifications.forEach(n => {
      const group = getDayGroup(n.createdAt);
      if (groups[group]) {
        groups[group].push(n);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [filteredNotifications]);

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await markNotificationRead(notif._id);
    }
    
    if (notif.taskId) {
      navigate(`/dashboard/${activeWorkspace?.slug || 'ws'}/task/${notif.taskId}`);
    } else if (notif.projectId) {
      navigate(`/dashboard/${activeWorkspace?.slug || 'ws'}/project/${notif.projectId}`);
    }
  };

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 size={48} className="tp-text-accent" />}
        title="You're all caught up 🎉"
        description="No new assignments, mentions, or updates."
      />
    );
  }

  return (
    <div className="tp-inbox">
      <div className="tp-inbox-header-controls">
        <h2 className="tp-inbox-title">Inbox</h2>
        <div className="tp-inbox-filters">
          <button 
            className={`tp-chip ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >All</button>
          <button 
            className={`tp-chip ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >Unread</button>
          <button 
            className={`tp-chip ${filter === 'mentions' ? 'active' : ''}`}
            onClick={() => setFilter('mentions')}
          >Mentions</button>
          <button 
            className={`tp-chip ${filter === 'assignments' ? 'active' : ''}`}
            onClick={() => setFilter('assignments')}
          >Assignments</button>
          
          <button 
            className="tp-btn-ghost tp-btn-sm" 
            style={{ marginLeft: 8 }}
            onClick={() => markAllNotificationsRead(activeWorkspace?._id)}
          >Mark all as read</button>
        </div>
      </div>

      <div className="tp-inbox-list">
        {groupedNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 40, color: 'var(--tp-text-muted)' }}>
            No notifications match this filter.
          </div>
        ) : (
          groupedNotifications.map(([groupName, items]) => (
            <div key={groupName} className="tp-inbox-group">
              <h3 className="tp-inbox-group-title">{groupName}</h3>
              {items.map(notif => (
                <div
                  key={notif._id}
                  className={`tp-inbox-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="tp-inbox-item-icon">
                    {notif.actorId?.avatar ? (
                      <img src={notif.actorId.avatar} alt="User" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    ) : (
                      NOTIF_ICONS[notif.type] || NOTIF_ICONS.system
                    )}
                  </div>
                  <div className="tp-inbox-item-content">
                    <p className="tp-inbox-item-title">
                      {notif.actorId?.name ? <strong>{notif.actorId.name} </strong> : null}
                      {notif.title}
                    </p>
                    <p className="tp-inbox-item-preview">{notif.preview}</p>
                  </div>
                  <span className="tp-inbox-item-time">{formatTime(notif.createdAt)}</span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
