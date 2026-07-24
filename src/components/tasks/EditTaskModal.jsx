import { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../api/client';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import CustomMultiSelect from '../shared/CustomMultiSelect';

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

export default function EditTaskModal({ task, onClose, onUpdate }) {
  const { activeWorkspace } = useWorkspace();
  const [title, setTitle] = useState(task?.title || '');
  const [summary, setSummary] = useState(task?.summary || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'todo');
  const [priority, setPriority] = useState(task?.priority || 3);
  const [projectId, setProjectId] = useState(task?.projectId?._id || task?.projectId || '');
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo?._id || task?.assignedTo || '');
  const [userLabels, setUserLabels] = useState(task?.userLabels || task?.labels || []);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [updating, setUpdating] = useState(false);

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
      } catch (err) {
        console.error('Failed to fetch modal data', err);
      }
    };
    fetchData();
  }, [activeWorkspace]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleLabelChange = (selectedLabels) => {
    setUserLabels(selectedLabels);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.size <= 15 * 1024 * 1024); // 15MB limit
    if (validFiles.length !== files.length) {
      alert('Some files exceed the 15MB limit and were removed.');
    }
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    setUpdating(true);
    try {
      const updatedData = { 
        title, 
        summary,
        description, 
        status, 
        priority,
        projectId,
        assignedTo: assignedTo || null,
        userLabels
      };
      
      const updatedTask = await onUpdate?.(task._id || task.id, updatedData);
      
      if (updatedTask && selectedFiles.length > 0) {
        // Upload attachments
        for (const file of selectedFiles) {
          const { data } = await api.post(`/tasks/${updatedTask._id || task._id || task.id}/attachments`, {
            workspaceId: activeWorkspace._id,
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type
          });
          
          await fetch(data.presignedUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
          });
        }
      }
      
      onClose();
    } catch (err) {
      console.error('Failed to update task', err);
    } finally {
      setUpdating(false);
    }
  };

  const labelOptions = (activeWorkspace?.customLabels || []).map(l => ({ value: l, label: l }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-tp-border bg-tp-surface shadow-tp-overlay flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between border-b border-tp-border px-6 py-4 bg-tp-bg">
          <h2 className="text-lg font-semibold text-tp-foreground">Edit Task</h2>
          <button 
            onClick={onClose}
            className="rounded-md p-1.5 text-tp-muted transition-colors hover:bg-tp-surface-hover hover:text-tp-foreground"
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-tp-foreground">Project <span className="text-tp-danger">*</span></label>
            <select
              className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 appearance-none"
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-tp-foreground">Task Title <span className="text-tp-danger">*</span></label>
            <input 
              type="text"
              placeholder="e.g. Fix login redirect loop"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 placeholder:text-tp-muted"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-tp-foreground">Summary</label>
            <input 
              type="text"
              placeholder="Brief summary..."
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 placeholder:text-tp-muted"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-tp-foreground">Description</label>
            <textarea 
              placeholder="Describe the task..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 placeholder:text-tp-muted resize-y"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tp-foreground">Status</label>
              <select
                className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 appearance-none"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tp-foreground">Priority</label>
              <select
                className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 appearance-none"
                value={priority}
                onChange={e => setPriority(Number(e.target.value))}
              >
                {PRIORITY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tp-foreground">Assignee</label>
              <select
                className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 appearance-none"
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name || m.email}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tp-foreground">Labels</label>
              <CustomMultiSelect 
                options={labelOptions}
                value={userLabels}
                onChange={handleLabelChange}
                placeholder="Select labels..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-tp-foreground">Attachments</label>
            <div className="flex items-center justify-between p-3 border border-dashed border-tp-border rounded-md bg-tp-bg hover:bg-tp-surface transition-colors cursor-pointer" onClick={() => document.getElementById('task-file-upload').click()}>
              <span className="text-sm text-tp-muted flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                Click to attach files (Max 15MB)
              </span>
              <input id="task-file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
            {selectedFiles.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 bg-tp-surface rounded-md border border-tp-border text-sm">
                    <span className="truncate max-w-[200px] text-tp-foreground">{file.name}</span>
                    <button type="button" onClick={() => removeFile(idx)} className="text-tp-muted hover:text-tp-danger">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </form>
        
        <div className="flex items-center justify-end gap-3 border-t border-tp-border bg-tp-bg px-6 py-4">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium text-tp-foreground hover:bg-tp-surface transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={updating || !title.trim() || !projectId}
            className="px-4 py-2 rounded-md bg-tp-accent text-sm font-medium text-tp-accent-foreground transition-colors hover:bg-tp-accent-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-tp-sm"
          >
            {updating ? 'Updating...' : 'Update Task'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
