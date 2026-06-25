import { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../api/client';

const STATUS_OPTIONS = [
  { value: 'todo', label: 'Todo' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'review', label: 'In Review' },
  { value: 'done', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 5, label: 'Urgent' },
  { value: 4, label: 'High' },
  { value: 3, label: 'Medium' },
  { value: 2, label: 'Low' },
  { value: 1, label: 'No priority' },
];

export default function CreateTaskModal({ onClose, onSubmit }) {
  const { activeWorkspace } = useWorkspace();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState(3);
  const [projectId, setProjectId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [userLabels, setUserLabels] = useState('');
  const [creating, setCreating] = useState(false);

  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (!activeWorkspace) return;
    
    const fetchData = async () => {
      try {
        const [projRes, membersRes] = await Promise.all([
          api.get(`/projects?workspaceId=${activeWorkspace._id}`),
          api.get(`/workspaces/${activeWorkspace._id}/members`)
        ]);
        setProjects(projRes.data.projects || []);
        setMembers(membersRes.data.members || []);
        
        if (projRes.data.projects?.length > 0) {
          setProjectId(projRes.data.projects[0]._id);
        }
      } catch (err) {
        console.error('Failed to fetch modal data', err);
      }
    };
    fetchData();
  }, [activeWorkspace]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    setCreating(true);
    try {
      const labelsArray = userLabels.split(',').map(l => l.trim()).filter(Boolean);
      await onSubmit?.({ 
        title, 
        summary,
        description, 
        status, 
        priority,
        projectId,
        assignedTo: assignedTo || null,
        userLabels: labelsArray
      });
      onClose();
    } catch {
      // handle error
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="tp-modal-overlay" onClick={onClose}>
      <div className="tp-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, overflowY: 'auto', maxHeight: '90vh' }}>
        <div className="tp-modal-header">
          <h2 className="tp-modal-title">Create new task</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="tp-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'visible' }}>
            
            <div className="tp-form-group">
              <label className="tp-form-label">Project *</label>
              <select
                className="tp-form-input tp-form-select"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                required
              >
                <option value="" disabled>Select a project</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="tp-form-group">
              <label className="tp-form-label">Task Title *</label>
              <input
                className="tp-form-input"
                type="text"
                placeholder="e.g. Fix login redirect loop"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="tp-form-group">
              <label className="tp-form-label">Summary</label>
              <input
                className="tp-form-input"
                type="text"
                placeholder="Brief summary..."
                value={summary}
                onChange={e => setSummary(e.target.value)}
              />
            </div>

            <div className="tp-form-group">
              <label className="tp-form-label">Description</label>
              <textarea
                className="tp-form-input tp-form-textarea"
                placeholder="Describe the task..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="tp-form-row">
              <div className="tp-form-group">
                <label className="tp-form-label">Status</label>
                <select
                  className="tp-form-input tp-form-select"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="tp-form-group">
                <label className="tp-form-label">Priority</label>
                <select
                  className="tp-form-input tp-form-select"
                  value={priority}
                  onChange={e => setPriority(Number(e.target.value))}
                >
                  {PRIORITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="tp-form-row">
              <div className="tp-form-group">
                <label className="tp-form-label">Assignee</label>
                <select
                  className="tp-form-input tp-form-select"
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m._id} value={m._id}>{m.name || m.email}</option>
                  ))}
                </select>
              </div>
              <div className="tp-form-group">
                <label className="tp-form-label">Labels (comma separated)</label>
                <input
                  className="tp-form-input"
                  type="text"
                  placeholder="e.g. frontend, bug"
                  value={userLabels}
                  onChange={e => setUserLabels(e.target.value)}
                />
              </div>
            </div>

          </div>

          <div className="tp-modal-footer" style={{ marginTop: '16px' }}>
            <button type="button" className="tp-btn tp-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="tp-btn tp-btn-primary" disabled={creating || !title.trim() || !projectId}>
              {creating ? 'Creating...' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
