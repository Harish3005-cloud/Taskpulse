import { useState } from 'react';
import { Button } from '../ui/button';

export default function CreateViewModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    status: 'all',
    priority: 'any',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit({
      name: formData.name,
      filters: {
        status: formData.status,
        priority: formData.priority,
      }
    });
  };

  return (
    <div className="tp-modal-overlay" onClick={onClose}>
      <div className="tp-modal" onClick={e => e.stopPropagation()}>
        <div className="tp-modal-header">
          <h2>Create Custom View</h2>
          <button className="tp-modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="tp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--tp-text-muted)' }}>View Name *</label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. High Priority Bugs"
              className="tp-input"
              required
              autoFocus
            />
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--tp-text-muted)' }}>Status Filter</label>
            <select name="status" value={formData.status} onChange={handleChange} className="tp-input">
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--tp-text-muted)' }}>Priority Filter</label>
            <select name="priority" value={formData.priority} onChange={handleChange} className="tp-input">
              <option value="any">Any Priority</option>
              <option value="5">High (5)</option>
              <option value="4">Medium-High (4)</option>
              <option value="3">Medium (3)</option>
              <option value="2">Low-Medium (2)</option>
              <option value="1">Low (1)</option>
            </select>
          </div>

          <div className="tp-modal-footer" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={!formData.name.trim()}>Create View</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
