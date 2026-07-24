import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Shield } from 'lucide-react';
import api from '../../api/client';

export default function InviteMemberModal({ isOpen, onClose, projectId, workspaceId, onInviteSuccess }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await api.post(`/projects/${projectId}/invite`, {
        workspaceId,
        email,
        role
      });
      onInviteSuccess();
      onClose();
      setEmail('');
      setRole('member');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-tp-surface border border-tp-border rounded-xl shadow-tp-2xl overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-tp-border">
            <h2 className="text-lg font-semibold text-tp-foreground">Invite to Project</h2>
            <button onClick={onClose} className="p-1 rounded-md text-tp-muted hover:text-tp-foreground hover:bg-tp-bg transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleInvite} className="p-4 flex flex-col gap-4">
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tp-foreground">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-tp-muted" />
                </div>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  className="w-full bg-tp-bg border border-tp-border rounded-md pl-10 pr-3 py-2 text-sm text-tp-foreground placeholder-tp-muted focus:outline-none focus:border-tp-accent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tp-foreground">Role</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield size={16} className="text-tp-muted" />
                </div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-tp-bg border border-tp-border rounded-md pl-10 pr-3 py-2 text-sm text-tp-foreground appearance-none focus:outline-none focus:border-tp-accent"
                >
                  <option value="member">Member (Can edit tasks)</option>
                  <option value="viewer">Viewer (Read-only access)</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-tp-muted">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-tp-danger-soft border border-tp-danger/20 rounded-md">
                <p className="text-xs text-tp-danger">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 mt-2 border-t border-tp-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-tp-foreground bg-tp-surface border border-tp-border hover:bg-tp-bg rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-tp-accent hover:bg-tp-accent/90 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
