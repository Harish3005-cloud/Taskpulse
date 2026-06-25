import { useState } from 'react';

export default function CreateWorkspaceModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      await onSubmit?.({ name });
      onClose();
    } catch {
      // handle error
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="tp-modal-overlay" onClick={onClose}>
      <div className="tp-modal" onClick={e => e.stopPropagation()}>
        <div className="tp-modal-header">
          <h2 className="tp-modal-title">Create new workspace</h2>
          <p className="tp-modal-desc">A workspace is where your team organizes and manages tasks.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="tp-modal-body">
            <div className="tp-form-group">
              <label className="tp-form-label">Workspace Name</label>
              <input
                className="tp-form-input"
                type="text"
                placeholder="e.g. Product Team, Marketing"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="tp-modal-footer">
            <button type="button" className="tp-btn tp-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="tp-btn tp-btn-primary" disabled={creating || !name.trim()}>
              {creating ? 'Creating...' : 'Create workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
