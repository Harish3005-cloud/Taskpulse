import { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../api/client';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import CustomMultiSelect from '../shared/CustomMultiSelect';

export default function EditProjectModal({ project, onClose, onSubmit }) {
  const { activeWorkspace } = useWorkspace();
  const [members, setMembers] = useState([]);
  
  // Format dates for input[type="date"]
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (_e) {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    name: project.name || '',
    summary: project.summary || '',
    description: project.description || '',
    startDate: formatDate(project.startDate),
    targetDate: formatDate(project.targetDate),
    leadId: project.lead?._id || project.lead || '',
    memberIds: (project.members || []).map(m => m._id || m),
    labels: project.labels || [],
    status: project.status || 'todo'
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [saving, setSaving] = useState(false);

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

  const handleMemberChange = (selectedIds) => {
    setFormData(prev => ({ ...prev, memberIds: selectedIds }));
  };

  const handleLabelChange = (selectedLabels) => {
    setFormData(prev => ({ ...prev, labels: selectedLabels }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => f.size <= 15 * 1024 * 1024);
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
    if (!formData.name.trim()) return;
    
    const submitData = {
      ...formData,
      lead: formData.leadId || undefined,
      members: formData.memberIds.map(id => ({ user: id, role: 'member' }))
    };
    
    delete submitData.leadId;
    delete submitData.memberIds;
    if (!submitData.startDate) submitData.startDate = null;
    if (!submitData.targetDate) submitData.targetDate = null;
    if (!submitData.lead) submitData.lead = null;
    
    setSaving(true);
    try {
      await onSubmit(submitData);
      
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const { data } = await api.post(`/projects/${project._id}/attachments`, {
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
      console.error('Failed to update project with attachments', err);
    } finally {
      setSaving(false);
    }
  };

  const memberOptions = members.map(m => ({ value: m._id, label: m.name || m.email }));
  const labelOptions = (activeWorkspace?.customLabels || []).map(l => ({ value: l, label: l }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          <h2 className="text-lg font-semibold text-tp-foreground">Edit Project</h2>
          <button 
            onClick={onClose}
            className="rounded-md p-1.5 text-tp-muted transition-colors hover:bg-tp-surface-hover hover:text-tp-foreground"
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-tp-foreground">Project Name <span className="text-tp-danger">*</span></label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Website Redesign"
              className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 placeholder:text-tp-muted"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-tp-foreground">Project Summary</label>
            <input 
              type="text"
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              placeholder="Short description of the project"
              className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 placeholder:text-tp-muted"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tp-foreground">Project Lead</label>
              <select 
                name="leadId"
                value={formData.leadId}
                onChange={handleChange}
                className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 appearance-none"
              >
                <option value="">Select a Lead</option>
                {members.map(m => (
                  <option key={m._id} value={m._id}>{m.name || m.email}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tp-foreground">Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 appearance-none"
              >
                <option value="todo">Todo</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tp-foreground">Start Date</label>
              <input 
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 [color-scheme:dark]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tp-foreground">Target Date</label>
              <input 
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-tp-foreground">Members</label>
            <CustomMultiSelect 
              options={memberOptions}
              value={formData.memberIds}
              onChange={handleMemberChange}
              placeholder="Assign team members..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-tp-foreground">Labels</label>
            <CustomMultiSelect 
              options={labelOptions}
              value={formData.labels}
              onChange={handleLabelChange}
              placeholder="Select project labels..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-tp-foreground">Detailed Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add more details about this project..."
              className="w-full rounded-md border border-tp-border bg-tp-bg px-3 py-2 text-sm text-tp-foreground outline-none transition-colors focus:border-tp-accent focus:ring-1 focus:ring-tp-accent/20 placeholder:text-tp-muted resize-y"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-tp-foreground">Attachments</label>
            </div>
            
            {/* Existing Attachments */}
            {(project.attachments || []).length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {project.attachments.map((file, i) => (
                  <a 
                    key={i} 
                    href={file.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-tp-surface rounded-md border border-tp-border text-sm text-tp-foreground hover:bg-tp-surface-hover transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                    <span className="truncate">{file.fileName}</span>
                  </a>
                ))}
              </div>
            )}

            {/* Upload New */}
            <div className="flex items-center justify-between p-3 border border-dashed border-tp-border rounded-md bg-tp-bg hover:bg-tp-surface transition-colors cursor-pointer" onClick={() => document.getElementById('edit-project-file-upload').click()}>
              <span className="text-sm text-tp-muted flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                Upload new files (Max 15MB)
              </span>
              <input id="edit-project-file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
            </div>
            {selectedFiles.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                {selectedFiles.map((file, idx) => (
                  <div key={`new-${idx}`} className="flex items-center justify-between px-3 py-2 bg-tp-surface rounded-md border border-tp-border text-sm">
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
            disabled={saving || !formData.name.trim()}
            className="px-4 py-2 rounded-md bg-tp-accent text-sm font-medium text-tp-accent-foreground transition-colors hover:bg-tp-accent-hover disabled:opacity-50 disabled:cursor-not-allowed shadow-tp-sm"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
