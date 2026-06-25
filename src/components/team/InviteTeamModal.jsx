import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../api/client';

export default function InviteTeamModal({ onClose }) {
  const { activeWorkspace } = useWorkspace();
  const [emails, setEmails] = useState(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmail = (index) => {
    const newEmails = [...emails];
    newEmails.splice(index, 1);
    if (newEmails.length === 0) newEmails.push('');
    setEmails(newEmails);
  };

  const handleEmailChange = (index, value) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Filter out empty emails
    const validEmails = emails.filter(email => email.trim() !== '');
    
    if (validEmails.length === 0) {
      setError('Please enter at least one valid email address.');
      return;
    }

    setIsLoading(true);

    try {
      await api.post(`/workspaces/${activeWorkspace._id}/invites`, {
        expiresInDays: 7,
        emails: validEmails
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to send invites:', err);
      setError(err.response?.data?.error?.message || 'An error occurred while sending invites.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Invite Team Members</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-md transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <h3 className="text-lg font-medium text-[var(--text-primary)]">Invites Sent!</h3>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                We've emailed the invitation links to your team.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Email Addresses
                </label>
                <div className="space-y-3">
                  {emails.map((email, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(idx, e.target.value)}
                        placeholder="colleague@example.com"
                        className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg py-2 px-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveEmail(idx)}
                        className="p-2 text-[var(--text-muted)] hover:text-red-500 rounded-md transition-colors"
                        disabled={emails.length === 1 && emails[0] === ''}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="text-sm text-[var(--accent)] font-medium mt-3 flex items-center gap-1 hover:opacity-80 transition-opacity"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  Add another
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500">
                  {error}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border-subtle)] mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Invites'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
