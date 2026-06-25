import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../api/client';

export default function CreateProjectModal({ onClose, onSubmit }) {
  const { activeWorkspace } = useWorkspace();
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    summary: '',
    description: '',
    startDate: '',
    targetDate: '',
    leadId: '',
    memberIds: [],
    labels: [],
    status: 'todo'
  });

  useEffect(() => {
    if (!activeWorkspace) return;
    api.get(`/workspaces/${activeWorkspace._id}/members`)
      .then(res => setMembers(res.data.members || []))
      .catch(err => console.error(err));
  }, [activeWorkspace]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberSelect = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setFormData(prev => ({ ...prev, memberIds: selected }));
  };

  const handleLabelSelect = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setFormData(prev => ({ ...prev, labels: selected }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="tp-modal-overlay" onClick={onClose}>
      <div className="tp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <div className="tp-modal-header">
          <h2>Create New Project</h2>
          <button className="tp-modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="tp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--tp-text-muted)' }}>Project Name *</label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Website Redesign"
              className="tp-input"
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--tp-text-muted)' }}>Project Summary</label>
            <input 
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Short description of the project"
              className="tp-input"
            />
          </div>

          <div className="tp-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--tp-text-muted)' }}>Project Lead</label>
              <select 
                name="leadId"
                value={formData.leadId}
                onChange={handleChange}
                className="tp-input"
              >
                <option value="">Select a Lead</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name || m.email}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--tp-text-muted)' }}>Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="tp-input"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--tp-text-muted)' }}>Labels</label>
            <select 
              multiple
              name="labels"
              value={formData.labels}
              onChange={handleLabelSelect}
              className="tp-input"
              style={{ minHeight: '80px' }}
            >
              {(activeWorkspace?.customLabels || []).map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
            <span style={{ fontSize: '11px', color: 'var(--tp-text-muted)' }}>Hold Ctrl/Cmd to select multiple</span>
          </div>

          <div className="tp-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--tp-text-muted)' }}>Start Date</label>
              <input 
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="tp-input"
              />
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--tp-text-muted)' }}>Target Date</label>
              <input 
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                className="tp-input"
              />
            </div>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--tp-text-muted)' }}>Members</label>
            <select 
              multiple
              name="memberIds"
              value={formData.memberIds}
              onChange={handleMemberSelect}
              className="tp-input"
              style={{ minHeight: '80px' }}
            >
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name || m.email}</option>
              ))}
            </select>
            <span style={{ fontSize: '11px', color: 'var(--tp-text-muted)' }}>Hold Ctrl/Cmd to select multiple</span>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--tp-text-muted)' }}>Detailed Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more details about this project..."
              className="tp-input"
              rows={3}
            />
          </div>

          <div className="tp-modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={!formData.name.trim()}>Create Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
