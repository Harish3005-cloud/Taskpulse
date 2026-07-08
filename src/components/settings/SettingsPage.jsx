import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, User, Bell, Tag, LayoutTemplate, Sparkles, Building2, Users, CreditCard, ChevronLeft, LogOut } from 'lucide-react';
import ProfileSection from './ProfileSection';
import NotificationsSection from './NotificationsSection';
import WorkspaceSection from './WorkspaceSection';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

// Reusable Animated Toggle
const AnimatedToggle = ({ isActive, onToggle }) => {
  return (
    <div 
      className={cn(
        "w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300",
        isActive ? "bg-tp-accent" : "bg-tp-border-strong"
      )}
      onClick={onToggle}
    >
      <motion.div 
        className="bg-white w-4 h-4 rounded-full shadow-sm"
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        animate={{ x: isActive ? 16 : 0 }}
      />
    </div>
  );
};

export default function SettingsPage() {
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState('preferences');

  const settingsSections = [
    {
      title: 'Personal',
      items: [
        { key: 'preferences', label: 'Preferences', icon: Settings },
        { key: 'profile', label: 'Profile', icon: User },
        { key: 'notifications', label: 'Notifications', icon: Bell },
      ],
    },
    {
      title: 'Issues',
      items: [
        { key: 'labels', label: 'Labels', icon: Tag },
        { key: 'templates', label: 'Templates', icon: LayoutTemplate },
      ],
    },
    {
      title: 'Features',
      items: [
        { key: 'ai', label: 'AI & Agents', icon: Sparkles },
      ],
    },
    {
      title: 'Administration',
      items: [
        { key: 'workspace', label: 'Workspace', icon: Building2 },
        { key: 'members', label: 'Members', icon: Users },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'workspace':
        return <WorkspaceSection />;
      default:
        return <PreferencesContent />;
    }
  };

  return (
    <div className="flex h-full w-full bg-tp-bg overflow-hidden">
      
      {/* Settings Sidebar */}
      <div className="w-64 flex-none border-r border-tp-border bg-tp-surface flex flex-col h-full">
        <div className="p-4 border-b border-tp-border">
          <Link 
            to="/dashboard/inbox" 
            className="flex items-center gap-2 text-sm font-medium text-tp-muted hover:text-tp-foreground transition-colors group w-fit"
          >
            <div className="p-1 rounded-md group-hover:bg-tp-bg transition-colors">
              <ChevronLeft size={16} />
            </div>
            Back to app
          </Link>
        </div>
        
        <div className="p-4 border-b border-tp-border">
          <input 
            className="w-full bg-tp-bg border border-tp-border rounded-lg px-3 py-1.5 text-sm text-tp-foreground placeholder-tp-muted focus:outline-none focus:border-tp-accent transition-colors" 
            placeholder="Search settings..." 
          />
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {settingsSections.map(section => (
            <div key={section.title}>
              <div className="px-3 mb-2 text-[11px] font-semibold text-tp-muted uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.key;
                  return (
                    <div
                      key={item.key}
                      onClick={() => setActiveSection(item.key)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all",
                        isActive 
                          ? "bg-tp-accent/10 text-tp-accent" 
                          : "text-tp-foreground hover:bg-tp-surface-hover"
                      )}
                    >
                      <Icon size={16} className={isActive ? "text-tp-accent" : "text-tp-muted"} />
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-tp-border">
          <button
            onClick={async () => {
              await logout();
              window.location.href = '/';
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-tp-bg border border-tp-border rounded-lg text-sm font-medium text-tp-danger hover:bg-tp-danger-soft transition-colors"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 overflow-y-auto bg-tp-bg">
        <div className="max-w-3xl mx-auto px-10 py-12">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

/**
 * PreferencesContent — the default preferences sub-page
 */
function PreferencesContent() {
  const [aiScoring, setAiScoring] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div>
        <h1 className="text-2xl font-bold text-tp-foreground tracking-tight mb-2">Preferences</h1>
        <p className="text-sm text-tp-muted">Manage your personal app preferences and interface settings.</p>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-tp-foreground uppercase tracking-wider border-b border-tp-border pb-2">General</h3>

        <div className="flex items-start justify-between gap-8">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-tp-foreground">Default home view</p>
            <p className="text-sm text-tp-muted">Select which view to display when launching TaskPulse.</p>
          </div>
          <select className="bg-tp-surface border border-tp-border rounded-lg px-3 py-2 text-sm text-tp-foreground min-w-[140px] focus:outline-none focus:border-tp-accent">
            <option>Active tasks</option>
            <option>My tasks</option>
            <option>Inbox</option>
          </select>
        </div>

        <div className="flex items-start justify-between gap-8">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-tp-foreground">Display names</p>
            <p className="text-sm text-tp-muted">Select how names are displayed in the interface.</p>
          </div>
          <select className="bg-tp-surface border border-tp-border rounded-lg px-3 py-2 text-sm text-tp-foreground min-w-[140px] focus:outline-none focus:border-tp-accent">
            <option>Full name</option>
            <option>First name</option>
            <option>Username</option>
          </select>
        </div>

        <div className="flex items-start justify-between gap-8 pt-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-tp-foreground">Enable AI task scoring</p>
            <p className="text-sm text-tp-muted">Automatically analyze and score new tasks using AI priority algorithms.</p>
          </div>
          <AnimatedToggle isActive={aiScoring} onToggle={() => setAiScoring(!aiScoring)} />
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-sm font-semibold text-tp-foreground uppercase tracking-wider border-b border-tp-border pb-2 mt-10">Interface & Theme</h3>

        <div className="flex items-start justify-between gap-8">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-tp-foreground">Interface theme</p>
            <p className="text-sm text-tp-muted">Select your preferred color scheme.</p>
          </div>
          <select className="bg-tp-surface border border-tp-border rounded-lg px-3 py-2 text-sm text-tp-foreground min-w-[140px] focus:outline-none focus:border-tp-accent">
            <option>Dark</option>
            <option>Light</option>
            <option>System preference</option>
          </select>
        </div>

        <div className="flex items-start justify-between gap-8">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-tp-foreground">Font size</p>
            <p className="text-sm text-tp-muted">Adjust the size of text across the app.</p>
          </div>
          <select className="bg-tp-surface border border-tp-border rounded-lg px-3 py-2 text-sm text-tp-foreground min-w-[140px] focus:outline-none focus:border-tp-accent">
            <option>Default</option>
            <option>Small</option>
            <option>Large</option>
          </select>
        </div>

        <div className="flex items-start justify-between gap-8 pt-2">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-tp-foreground">AI Weekly Digest</p>
            <p className="text-sm text-tp-muted">Receive AI-generated weekly summaries of your workspace activity.</p>
          </div>
          <AnimatedToggle isActive={weeklyDigest} onToggle={() => setWeeklyDigest(!weeklyDigest)} />
        </div>
      </div>
    </motion.div>
  );
}
