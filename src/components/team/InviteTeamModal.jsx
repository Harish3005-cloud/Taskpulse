import React from 'react';

/**
 * InviteTeamModal — now points users to project-level invitations.
 * Workspace-level invites have been removed; members join specific projects.
 */
export default function InviteTeamModal({ onClose }) {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-tp-bg border border-tp-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-tp-border bg-tp-surface">
          <h2 className="text-lg font-semibold text-tp-foreground">Invite Members</h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-tp-muted hover:text-tp-foreground hover:bg-tp-bg rounded-md transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-tp-accent-soft text-tp-accent rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5.5" />
              <path d="M8.5 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-tp-foreground mb-2">Invitations are project-level</h3>
          <p className="text-sm text-tp-muted leading-relaxed">
            To invite collaborators, open the project you'd like to share and click the <strong className="text-tp-foreground">+</strong> button in the Team section. Each invited member will only have access to that specific project.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-5 py-2.5 bg-tp-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
