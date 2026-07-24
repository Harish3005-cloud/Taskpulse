import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskStatusBadge from './TaskStatusBadge';
import TaskPriorityBadge from './TaskPriorityBadge';
import Avatar from '../shared/Avatar';
import CustomMultiSelect from '../shared/CustomMultiSelect';
import api from '../../api/client';
import { useWorkspace } from '../../context/WorkspaceContext';

/**
 * TaskDetailPanel — slide-in panel (right side) showing task detail.
 * Like Linear's side-peek.
 */
export default function TaskDetailPanel({ task, onClose, onUpdateTask, members = [] }) {
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const [localTask, setLocalTask] = useState(task);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  if (!localTask) return null;

  const handleUpdate = async (field, value) => {
    if (localTask[field] === value) return;
    
    // Optimistic update
    const previousTask = { ...localTask };
    setLocalTask(prev => ({ ...prev, [field]: value }));
    if (onUpdateTask) {
      onUpdateTask(localTask._id, { [field]: value });
    }

    try {
      await api.patch(`/tasks/${localTask._id}`, { 
        workspaceId: activeWorkspace._id,
        [field]: value 
      });
    } catch (err) {
      console.error('Failed to update task:', err);
      // Revert on failure
      setLocalTask(previousTask);
      if (onUpdateTask) {
        onUpdateTask(localTask._id, { [field]: previousTask[field] });
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert('File size exceeds 15MB limit.');
      return;
    }

    try {
      setUploading(true);
      
      const { data } = await api.post(`/tasks/${localTask._id}/attachments`, {
        workspaceId: activeWorkspace._id,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      });

      const { presignedUrl, attachment } = data;

      await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      const updatedAttachments = [...(localTask.attachments || []), attachment];
      setLocalTask(prev => ({ ...prev, attachments: updatedAttachments }));
      if (onUpdateTask) {
        onUpdateTask(localTask._id, { attachments: updatedAttachments });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload attachment');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="tp-detail-panel-backdrop" onClick={onClose} />

      {/* Panel */}
      <div className="tp-detail-panel">
        {/* Panel Header */}
        <div className="tp-detail-panel-header">
          <span className="tp-detail-panel-id">{task.identifier}</span>
          <div className="tp-detail-panel-header-actions">
            <button
              className="tp-icon-btn"
              title="Open full page"
              onClick={() => navigate(`/${activeWorkspace?.slug || activeWorkspace?._id}/projects/${localTask.projectId}`)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H3a1 1 0 00-1 1v2M9 2h2a1 1 0 011 1v2M5 12H3a1 1 0 01-1-1V9M9 12h2a1 1 0 001-1V9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="tp-icon-btn" title="Close panel" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="tp-detail-panel-content">
          {/* Title */}
          <input 
            className="tp-detail-panel-title" 
            style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none' }}
            value={localTask.title}
            onChange={(e) => setLocalTask(prev => ({ ...prev, title: e.target.value }))}
            onBlur={(e) => handleUpdate('title', e.target.value)}
          />

          {/* Description */}
          <textarea 
            className="tp-detail-panel-desc"
            value={localTask.description || ''}
            onChange={(e) => setLocalTask(prev => ({ ...prev, description: e.target.value }))}
            onBlur={(e) => handleUpdate('description', e.target.value)}
            placeholder="Add a description..."
          />

          {/* Properties */}
          <div className="tp-detail-panel-props">
            <div className="tp-detail-panel-prop">
              <span className="tp-detail-panel-prop-label">Status</span>
              <span className="tp-detail-panel-prop-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TaskStatusBadge status={localTask.status} />
                <select 
                  style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                  value={localTask.status}
                  onChange={(e) => handleUpdate('status', e.target.value)}
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </span>
            </div>

            <div className="tp-detail-panel-prop">
              <span className="tp-detail-panel-prop-label">Priority</span>
              <span className="tp-detail-panel-prop-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TaskPriorityBadge priority={localTask.priority} />
                <select 
                  style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', appearance: 'none', cursor: 'pointer', textTransform: 'capitalize' }}
                  value={localTask.priority || 3}
                  onChange={(e) => handleUpdate('priority', parseInt(e.target.value))}
                >
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                  <option value={4}>Urgent</option>
                  <option value={5}>Critical</option>
                </select>
              </span>
            </div>

            <div className="tp-detail-panel-prop">
              <span className="tp-detail-panel-prop-label">Assignee</span>
              <span className="tp-detail-panel-prop-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {localTask.assignedTo ? (
                  <Avatar name={localTask.assignedTo.name} size={20} />
                ) : (
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1px dashed var(--tp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</div>
                )}
                <select 
                  style={{ background: 'transparent', border: 'none', color: localTask.assignedTo ? 'inherit' : 'var(--tp-text-muted)', outline: 'none', appearance: 'none', cursor: 'pointer' }}
                  value={localTask.assignedTo?._id || ''}
                  onChange={(e) => {
                    const newAssigneeId = e.target.value;
                    const newAssigneeObj = members.find(m => m.user?._id === newAssigneeId)?.user || null;
                    
                    // Optimistic update of whole assignedTo object so Avatar renders
                    const prevTask = { ...localTask };
                    setLocalTask(prev => ({ ...prev, assignedTo: newAssigneeObj }));
                    if (onUpdateTask) {
                      onUpdateTask(localTask._id, { assignedTo: newAssigneeObj });
                    }
                    
                    api.patch(`/tasks/${localTask._id}`, { workspaceId: activeWorkspace._id, assignedTo: newAssigneeId || null })
                      .catch(err => {
                        console.error('Failed to assign:', err);
                        setLocalTask(prevTask);
                        if (onUpdateTask) onUpdateTask(localTask._id, { assignedTo: prevTask.assignedTo });
                      });
                  }}
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
                  ))}
                </select>
              </span>
            </div>

            <div className="tp-detail-panel-prop">
              <span className="tp-detail-panel-prop-label">Created</span>
              <span className="tp-detail-panel-prop-value">
                <span>{formatDate(localTask.createdAt)}</span>
              </span>
            </div>

            <div className="tp-detail-panel-prop">
              <span className="tp-detail-panel-prop-label">Due date</span>
              <span className="tp-detail-panel-prop-value">
                <input 
                  type="date" 
                  style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none' }}
                  value={localTask.dueDate ? localTask.dueDate.substring(0, 10) : ''}
                  onChange={(e) => handleUpdate('dueDate', e.target.value)}
                />
              </span>
            </div>

            <div className="tp-detail-panel-prop" style={{ alignItems: 'flex-start' }}>
              <span className="tp-detail-panel-prop-label" style={{ marginTop: '8px' }}>Labels</span>
              <span className="tp-detail-panel-prop-value" style={{ width: '100%', maxWidth: '200px' }}>
                <CustomMultiSelect 
                  options={(activeWorkspace?.customLabels || []).map(l => ({ value: l, label: l }))}
                  value={localTask.userLabels || []}
                  onChange={(selectedLabels) => handleUpdate('userLabels', selectedLabels)}
                  placeholder="Select labels..."
                />
              </span>
            </div>
          </div>

          {/* Attachments */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--tp-text)' }}>Attachments</h3>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{ fontSize: '12px', color: 'var(--tp-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {uploading ? 'Uploading...' : '+ Add'}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(localTask.attachments || []).length === 0 ? (
                <span style={{ fontSize: '12px', color: 'var(--tp-text-muted)' }}>No attachments</span>
              ) : (
                (localTask.attachments || []).map((file, i) => (
                  <a 
                    key={i} 
                    href={file.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--tp-surface-hover)',
                      borderRadius: '6px',
                      border: '1px solid var(--tp-border-subtle)',
                      fontSize: '12px',
                      color: 'var(--tp-text)',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    {file.fileName}
                  </a>
                ))
              )}
            </div>
          </div>

          {/* AI Score Card */}
          {localTask.ai?.priority != null && (
            <div className="tp-detail-panel-ai" style={{ marginTop: '24px' }}>
              <div className="tp-detail-panel-ai-header">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9l-3 1.5.5-3.5L2 4.5l3.5-.5L7 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
                AI Priority Score
              </div>
              <div className="tp-detail-panel-ai-score">
                <div className="tp-detail-panel-ai-score-num">{localTask.ai.priority}</div>
                <div className="tp-detail-panel-ai-score-bar">
                  <div
                    className="tp-detail-panel-ai-score-fill"
                    style={{ width: `${localTask.ai.priority * 10}%` }}
                  />
                </div>
                <span className="tp-detail-panel-ai-score-label">/10</span>
              </div>
              {localTask.ai.reasoning && (
                <p className="tp-detail-panel-ai-reason">{localTask.ai.reasoning}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
