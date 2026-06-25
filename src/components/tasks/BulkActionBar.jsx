import { useState } from 'react';
import api from '../../api/client';

/**
 * BulkActionBar — floating bar that appears when tasks are selected.
 * Shows count + action buttons: Status, Priority, Assign, Delete.
 */
export default function BulkActionBar({ selectedIds, onClearSelection, onActionComplete }) {
  const [activeAction, setActiveAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const count = selectedIds.size;

  if (count === 0) return null;

  const handleAction = async (field, value) => {
    setLoading(true);
    try {
      const updates = Array.from(selectedIds).map(id =>
        api.patch(`/tasks/${id}`, { [field]: value }).catch(() => null)
      );
      await Promise.all(updates);
      onActionComplete?.();
    } catch (err) {
      console.error('Bulk action failed:', err);
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${count} task(s)?`)) return;
    setLoading(true);
    try {
      const deletes = Array.from(selectedIds).map(id =>
        api.delete(`/tasks/${id}`).catch(() => null)
      );
      await Promise.all(deletes);
      onClearSelection?.();
      onActionComplete?.();
    } catch (err) {
      console.error('Bulk delete failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const STATUS_OPTIONS = [
    { value: 'backlog', label: 'Backlog', color: 'var(--tp-status-backlog)' },
    { value: 'todo', label: 'Todo', color: 'var(--tp-status-todo)' },
    { value: 'in_progress', label: 'In Progress', color: 'var(--tp-status-in-progress)' },
    { value: 'review', label: 'In Review', color: 'var(--tp-status-review)' },
    { value: 'done', label: 'Done', color: 'var(--tp-status-done)' },
    { value: 'cancelled', label: 'Cancelled', color: 'var(--tp-status-cancelled)' },
  ];

  const PRIORITY_OPTIONS = [
    { value: 'urgent', label: 'Urgent', color: 'var(--tp-priority-urgent)' },
    { value: 'high', label: 'High', color: 'var(--tp-priority-high)' },
    { value: 'medium', label: 'Medium', color: 'var(--tp-priority-medium)' },
    { value: 'low', label: 'Low', color: 'var(--tp-priority-low)' },
    { value: 'none', label: 'No priority', color: 'var(--tp-priority-none)' },
  ];

  return (
    <div className="tp-bulk-bar">
      <div className="tp-bulk-bar-inner">
        {/* Selection count */}
        <span className="tp-bulk-count">
          <span className="tp-bulk-count-num">{count}</span>
          selected
        </span>

        <div className="tp-bulk-divider" />

        {/* Action buttons */}
        <div className="tp-bulk-actions">
          {/* Status */}
          <div className="tp-bulk-action-wrap">
            <button
              className={`tp-bulk-action-btn ${activeAction === 'status' ? 'active' : ''}`}
              onClick={() => setActiveAction(activeAction === 'status' ? null : 'status')}
              disabled={loading}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
              Status
            </button>
            {activeAction === 'status' && (
              <div className="tp-bulk-dropdown">
                {STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className="tp-bulk-dropdown-item"
                    onClick={() => handleAction('status', opt.value)}
                  >
                    <span className="tp-bulk-dropdown-dot" style={{ background: opt.color }} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority */}
          <div className="tp-bulk-action-wrap">
            <button
              className={`tp-bulk-action-btn ${activeAction === 'priority' ? 'active' : ''}`}
              onClick={() => setActiveAction(activeAction === 'priority' ? null : 'priority')}
              disabled={loading}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="8" width="2" height="4" rx="0.5" fill="currentColor"/>
                <rect x="5.5" y="5" width="2" height="7" rx="0.5" fill="currentColor" opacity="0.5"/>
                <rect x="9" y="2" width="2" height="10" rx="0.5" fill="currentColor" opacity="0.25"/>
              </svg>
              Priority
            </button>
            {activeAction === 'priority' && (
              <div className="tp-bulk-dropdown">
                {PRIORITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className="tp-bulk-dropdown-item"
                    onClick={() => handleAction('priority', opt.value)}
                  >
                    <span className="tp-bulk-dropdown-dot" style={{ background: opt.color }} />
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delete */}
          <button
            className="tp-bulk-action-btn tp-bulk-action-danger"
            onClick={handleDelete}
            disabled={loading}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 4h8M5 4V3a1 1 0 011-1h2a1 1 0 011 1v1M4 4v7a1 1 0 001 1h4a1 1 0 001-1V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Delete
          </button>
        </div>

        <div style={{ flex: 1 }} />

        {/* Close */}
        <button
          className="tp-bulk-close"
          onClick={onClearSelection}
          title="Clear selection"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
