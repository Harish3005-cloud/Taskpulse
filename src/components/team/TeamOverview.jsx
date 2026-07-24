import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Link as LinkIcon, MoreHorizontal, Settings, LayoutGrid, CheckSquare, Layers, Plus, Mail, ShieldCheck } from 'lucide-react';
import Avatar from '../shared/Avatar';
import EmptyState from '../shared/EmptyState';
import InviteTeamModal from './InviteTeamModal';
import { cn } from '../../lib/utils';

const TEAM_COLORS = [
  'linear-gradient(135deg, #ef4444, #f97316)',
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #22c55e, #10b981)',
  'linear-gradient(135deg, #f59e0b, #eab308)',
  'linear-gradient(135deg, #ec4899, #f43f5e)',
];

export default function TeamOverview() {
  const { teamSlug } = useParams();
  const navigate = useNavigate();
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Find workspace by slug or name
  const workspace = workspaces.find(ws => ws.slug === teamSlug || ws.name?.toLowerCase().replace(/\s+/g, '-') === teamSlug) || activeWorkspace;

  // Set as active workspace if different
  if (workspace && workspace._id !== activeWorkspace?._id) {
    setActiveWorkspace(workspace);
  }

  const wsIndex = workspaces.findIndex(ws => ws._id === workspace?._id);
  const wsColor = TEAM_COLORS[wsIndex % TEAM_COLORS.length];
  const wsSlug = teamSlug;

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'documents', label: 'Documents' },
    { key: 'members', label: 'Members' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="flex-none h-14 border-b border-tp-border bg-tp-surface flex items-center justify-between px-5 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div 
            className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
            style={{ background: wsColor }}
          >
            {workspace?.name?.charAt(0)?.toUpperCase()}
          </div>
          <span className="font-semibold text-sm text-tp-foreground">{workspace?.name || 'Workspace'}</span>
          <div className="flex items-center gap-1 ml-2">
            <button className="p-1.5 text-tp-muted hover:text-tp-foreground hover:bg-tp-bg rounded-md transition-colors">
              <SparkleIcon />
            </button>
            <button className="p-1.5 text-tp-muted hover:text-tp-foreground hover:bg-tp-bg rounded-md transition-colors">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-tp-muted hover:text-tp-foreground hover:bg-tp-bg rounded-md transition-colors">
            <LinkIcon size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-none flex items-center px-6 border-b border-tp-border bg-tp-bg/50 backdrop-blur-md sticky top-14 z-10">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.key 
                ? "border-tp-accent text-tp-foreground" 
                : "border-transparent text-tp-muted hover:text-tp-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <button 
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-1.5 text-sm font-medium text-tp-muted hover:text-tp-accent transition-colors py-3"
        >
          <Plus size={16} />
          Invite Members
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex overflow-hidden bg-tp-bg">
        {activeTab === 'overview' && (
          <>
            {/* Main content */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 max-w-3xl">
              {/* Team Header */}
              <div className="flex items-center gap-5 mb-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-tp-md"
                  style={{ background: wsColor }}
                >
                  {workspace?.name?.charAt(0)?.toUpperCase()}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-tp-foreground">
                  {workspace?.name}
                </h1>
              </div>
              <p className="text-tp-muted text-sm mb-12 hover:text-tp-foreground cursor-text transition-colors w-fit">
                Add a description...
              </p>

              {/* Pinned Resources */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-tp-foreground">Pinned resources</h2>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-tp-muted hover:bg-tp-surface rounded-md transition-colors">
                      <LayoutGrid size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-tp-muted">
                  Add documents and links. Organize by creating sections.
                </p>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="w-64 flex-none border-l border-tp-border bg-tp-surface/50 p-6 overflow-y-auto hidden lg:block">
              <h3 className="text-xs font-semibold text-tp-muted uppercase tracking-wider mb-4">Members</h3>
              <div className="flex flex-wrap gap-2 mb-8">
                <Avatar name={user?.name || 'U'} size={32} />
                {workspace?.members?.slice(1).map((m, i) => (
                  <Avatar key={i} name={m.name || 'M'} size={32} />
                ))}
              </div>

              <h3 className="text-xs font-semibold text-tp-muted uppercase tracking-wider mb-4">Go to</h3>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Team settings', icon: Settings, to: `/dashboard/settings` },
                  { label: 'Issues', icon: CheckSquare, to: `/dashboard/${wsSlug}/tasks` },
                  { label: 'Projects', icon: Layers, to: `/dashboard/${wsSlug}/projects` },
                ].map(link => {
                  const Icon = link.icon;
                  return (
                    <div
                      key={link.label}
                      onClick={() => navigate(link.to)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-tp-muted hover:text-tp-foreground hover:bg-tp-surface-hover cursor-pointer transition-colors"
                    >
                      <Icon size={16} />
                      {link.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'documents' && (
          <div className="flex-1 overflow-y-auto">
            <EmptyState
              icon={<div className="p-4 bg-tp-surface rounded-2xl border border-tp-border shadow-sm"><LayoutGrid size={32} className="text-tp-muted" /></div>}
              title="No documents yet"
              description="Add documents and links to keep your team's important resources in one place."
              actionLabel="Add document"
            />
          </div>
        )}

        {activeTab === 'members' && (
          <div className="flex-1 overflow-y-auto p-8 lg:p-12">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-tp-foreground">Workspace Members</h2>
                  <p className="text-sm text-tp-muted mt-1">Manage team access and roles.</p>
                </div>
                <button 
                  onClick={() => setIsInviteOpen(true)}
                  className="px-4 py-2 bg-tp-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-tp-sm"
                >
                  <Mail size={16} />
                  Invite Members
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Current User Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-tp-surface border border-tp-border rounded-2xl p-5 flex flex-col justify-between hover:shadow-tp-sm transition-shadow group relative overflow-hidden"
                >
                  {/* Subtle gradient background based on workspace color */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" style={{ background: wsColor }} />
                  
                  <div className="flex items-start justify-between mb-6 relative z-10">
                    <Avatar name={user?.name || 'U'} size={48} />
                    <div className="px-2.5 py-1 bg-tp-accent-soft text-tp-accent text-[10px] font-bold uppercase tracking-wider rounded-md flex items-center gap-1">
                      <ShieldCheck size={12} />
                      Owner
                    </div>
                  </div>
                  <div className="relative z-10">
                    <h3 className="font-semibold text-tp-foreground flex items-center gap-2">
                      {user?.name || 'You'}
                      <span className="text-[10px] bg-tp-bg border border-tp-border px-1.5 py-0.5 rounded text-tp-muted">You</span>
                    </h3>
                    <p className="text-sm text-tp-muted">{user?.email || '—'}</p>
                  </div>
                </motion.div>

                {/* Other Members (Mocked for now since workspace.members just has name/id in some cases) */}
                {workspace?.members?.slice(1).map((m, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * (i + 1) }}
                    key={i} 
                    className="bg-tp-surface border border-tp-border rounded-2xl p-5 flex flex-col justify-between hover:border-tp-accent/50 hover:shadow-tp-sm transition-all group"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <Avatar name={m.name || 'M'} size={48} />
                      <div className="px-2.5 py-1 bg-tp-bg border border-tp-border text-tp-muted text-[10px] font-bold uppercase tracking-wider rounded-md">
                        Member
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-tp-foreground">{m.name || 'Team Member'}</h3>
                      <p className="text-sm text-tp-muted">{m.email || 'member@taskpulse.io'}</p>
                    </div>
                    
                    {/* Hover Actions */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 bg-tp-bg text-tp-muted hover:text-tp-danger rounded-md shadow-sm border border-tp-border transition-colors">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {isInviteOpen && <InviteTeamModal onClose={() => setIsInviteOpen(false)} />}
    </>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="7,1 9,5 13,5.5 10,8.5 10.8,12.5 7,10.5 3.2,12.5 4,8.5 1,5.5 5,5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
    </svg>
  );
}
