import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommandPalette } from '../../context/CommandPaletteContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useDebounce } from '../../hooks/useDebounce';
import api from '../../api/client';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '../ui/command';
import { Badge } from '../ui/badge';
import { Loader2, Clock, Search, User } from 'lucide-react';
import Avatar from '../shared/Avatar';

/* ── Constants ─────────────────────────────────────────────────────────── */

const RECENT_TASKS_KEY = 'recentTasks';
const MAX_RECENT = 5;

/** Status → dot colour mapping */
const STATUS_COLORS = {
  'todo': '#94a3b8',       // gray/slate
  'backlog': '#94a3b8',
  'in-progress': '#3b82f6', // blue
  'review': '#f59e0b',      // amber
  'done': '#22c55e',        // green
  'cancelled': '#6b7280',
};

/** Readable labels for statuses */
const STATUS_LABELS = {
  'todo': 'Todo',
  'backlog': 'Backlog',
  'in-progress': 'In Progress',
  'review': 'In Review',
  'done': 'Done',
  'cancelled': 'Cancelled',
};

/* ── Helpers ───────────────────────────────────────────────────────────── */

/** Return the colour for an AI priority score (1-10) */
function getPriorityColor(score) {
  if (score <= 3) return { bg: 'rgba(34,197,94,0.12)', text: '#22c55e', border: 'rgba(34,197,94,0.25)' };
  if (score <= 6) return { bg: 'rgba(245,158,11,0.12)', text: '#f59e0b', border: 'rgba(245,158,11,0.25)' };
  return { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', border: 'rgba(239,68,68,0.25)' };
}

/** Get recent tasks from localStorage */
function getRecentTasks() {
  try {
    const stored = localStorage.getItem(RECENT_TASKS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/** Save a task to recents */
function saveRecentTask(task) {
  try {
    const recent = getRecentTasks().filter(t => t.id !== task._id);
    recent.unshift({
      id: task._id,
      title: task.title,
      status: task.status,
      workspaceName: task.workspaceName || task.workspace?.name || '',
      aiPriority: task.ai?.priority ?? task.aiPriority ?? null,
      identifier: task.identifier || '',
    });
    localStorage.setItem(RECENT_TASKS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // Silently fail on localStorage errors
  }
}

/** Group tasks by their status */
function groupByStatus(tasks) {
  const groups = {};
  for (const task of tasks) {
    const status = task.status || 'todo';
    if (!groups[status]) groups[status] = [];
    groups[status].push(task);
  }
  // Return sorted by status order
  const order = ['in-progress', 'review', 'todo', 'backlog', 'done', 'cancelled'];
  return order
    .filter(s => groups[s]?.length)
    .map(s => ({ status: s, label: STATUS_LABELS[s] || s, tasks: groups[s] }));
}

/* ── Status Dot Component ──────────────────────────────────────────────── */

function StatusDot({ status }) {
  const color = STATUS_COLORS[status] || '#94a3b8';
  const isInProgress = status === 'in-progress';

  return (
    <span
      className="cp-status-dot"
      style={{
        '--dot-color': color,
        background: color,
        boxShadow: `0 0 0 2px ${color}20`,
      }}
    >
      {isInProgress && <span className="cp-status-dot-pulse" style={{ background: color }} />}
    </span>
  );
}

/* ── AI Priority Badge ─────────────────────────────────────────────────── */

function AIPriorityBadge({ score }) {
  if (score == null) return null;
  const colors = getPriorityColor(score);

  return (
    <span
      className="cp-priority-badge"
      style={{
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
        <path d="M7 1l1.5 3 3.5.5-2.5 2.5.5 3.5L7 9l-3 1.5.5-3.5L2 4.5l3.5-.5L7 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
      {score}
    </span>
  );
}

/* ── Loading Spinner ───────────────────────────────────────────────────── */

function SearchLoading() {
  return (
    <div className="cp-loading">
      <Loader2 className="cp-loading-spinner" size={18} />
      <span>Searching tasks...</span>
    </div>
  );
}

/* ── Task Result Item ──────────────────────────────────────────────────── */

function TaskResultItem({ task, onSelect }) {
  const title = task.title || 'Untitled';
  const workspace = task.workspaceName || task.workspace?.name || '';
  const aiScore = task.ai?.priority ?? task.aiPriority ?? null;

  return (
    <CommandItem
      value={`${task._id || task.id}-${title}`}
      onSelect={() => onSelect(task)}
      className="cp-task-item"
    >
      <StatusDot status={task.status || 'todo'} />
      <div className="cp-task-info">
        <span className="cp-task-title">{title}</span>
        {(task.identifier || workspace) && (
          <span className="cp-task-meta">
            {task.identifier && <span>{task.identifier}</span>}
            {task.identifier && workspace && <span className="cp-task-meta-sep">·</span>}
            {workspace && <span>{workspace}</span>}
          </span>
        )}
      </div>
      <AIPriorityBadge score={aiScore} />
    </CommandItem>
  );
}

/* ── Member Result Item ────────────────────────────────────────────────── */

function MemberResultItem({ member, onSelect }) {
  return (
    <CommandItem
      value={`member-${member._id}`}
      onSelect={() => onSelect(member)}
      className="cp-task-item"
    >
      <Avatar name={member.name || member.email} src={member.avatar} size={20} />
      <div className="cp-task-info">
        <span className="cp-task-title">{member.name || member.email}</span>
        {member.name && member.email && (
          <span className="cp-task-meta">{member.email}</span>
        )}
      </div>
    </CommandItem>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 * MAIN COMPONENT
 * ══════════════════════════════════════════════════════════════════════════ */

export default function CommandPalette({ onOpenTask }) {
  const { isOpen, close } = useCommandPalette();
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [taskResults, setTaskResults] = useState([]);
  const [memberResults, setMemberResults] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentTasks, setRecentTasks] = useState([]);

  const debouncedQuery = useDebounce(query, 300);
  const abortRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTaskResults([]);
      setMemberResults([]);
      setLoading(false);
      setRecentTasks(getRecentTasks());
      
      // Fetch workspace members once when palette opens
      if (activeWorkspace?._id) {
        api.get(`/workspaces/${activeWorkspace._id}/members`)
          .then(({ data }) => setAllMembers(data.members || []))
          .catch(err => console.error('Failed to fetch members for search:', err));
      }
    }
  }, [isOpen, activeWorkspace]);

  // Fetch tasks and filter members when debounced query changes
  useEffect(() => {
    if (!isOpen) return;

    if (!debouncedQuery.trim()) {
      setTaskResults([]);
      setMemberResults([]);
      setLoading(false);
      return;
    }

    // Abort previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const fetchTasks = async () => {
      setLoading(true);
      try {
        // 1. Fetch matching tasks
        const params = new URLSearchParams({
          search: debouncedQuery,
          limit: '8',
        });
        if (activeWorkspace?._id) {
          params.set('workspaceId', activeWorkspace._id);
        }
        const { data } = await api.get(`/tasks?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!controller.signal.aborted) {
          setTaskResults(data.data || data.tasks || []);
        }
      } catch (err) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          console.error('Command palette search failed:', err);
          setTaskResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    // 2. Filter members locally
    const lowerQuery = debouncedQuery.toLowerCase();
    const matchedMembers = allMembers.filter(m => 
      (m.name && m.name.toLowerCase().includes(lowerQuery)) ||
      (m.email && m.email.toLowerCase().includes(lowerQuery))
    );
    setMemberResults(matchedMembers);

    fetchTasks();

    return () => controller.abort();
  }, [debouncedQuery, isOpen, activeWorkspace]);

  // Handle selecting a task
  const handleSelectTask = useCallback((task) => {
    const taskData = {
      _id: task._id || task.id,
      title: task.title,
      status: task.status,
      workspaceName: task.workspaceName || task.workspace?.name || '',
      aiPriority: task.ai?.priority ?? task.aiPriority ?? null,
      identifier: task.identifier || '',
    };

    saveRecentTask(taskData);
    close();

    if (onOpenTask) {
      onOpenTask(taskData._id);
    } else {
      navigate(`/dashboard/task/${taskData._id}`);
    }
  }, [close, navigate, onOpenTask]);

  // Handle selecting a member
  const handleSelectMember = useCallback((member) => {
    close();
    // Use fallback to /dashboard/members/:id or workspace route
    const wsSlug = activeWorkspace?.slug || activeWorkspace?._id || 'workspace';
    navigate(`/dashboard/${wsSlug}/members/${member._id}`);
  }, [close, navigate, activeWorkspace]);

  // Handle selecting a recent task
  const handleSelectRecent = useCallback((recent) => {
    // Move to top of recents
    saveRecentTask({
      _id: recent.id,
      title: recent.title,
      status: recent.status,
      workspaceName: recent.workspaceName || '',
      aiPriority: recent.aiPriority ?? null,
      identifier: recent.identifier || '',
    });
    close();

    if (onOpenTask) {
      onOpenTask(recent.id);
    } else {
      navigate(`/dashboard/task/${recent.id}`);
    }
  }, [close, navigate, onOpenTask]);

  // Handle open state change from Dialog
  const handleOpenChange = useCallback((open) => {
    if (!open) close();
  }, [close]);

  // Determine what to show
  const hasQuery = query.trim().length > 0;
  const showLoading = loading && hasQuery;
  const statusGroups = !loading && hasQuery && taskResults.length > 0 ? groupByStatus(taskResults) : [];
  const showNoResults = !loading && hasQuery && taskResults.length === 0 && memberResults.length === 0 && debouncedQuery === query;
  const showRecent = !hasQuery && recentTasks.length > 0;
  const showPlaceholder = !hasQuery && recentTasks.length === 0;
  const totalResults = taskResults.length + memberResults.length;

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Search Tasks"
      description="Search for tasks across your workspace"
      className="cp-dialog sm:max-w-[560px]"
    >
      <Command
        className="cp-command"
        shouldFilter={false}
        loop
      >
        {/* Search Input */}
        <div className="cp-input-wrapper">
          <CommandInput
            placeholder="Search tasks, members..."
            value={query}
            onValueChange={setQuery}
          />
          <div className="cp-input-hints">
            <kbd className="cp-kbd">ESC</kbd>
          </div>
        </div>

        <CommandSeparator />

        {/* Results List */}
        <CommandList className="cp-list">
          {/* Loading State */}
          {showLoading && <SearchLoading />}

          {/* No Results */}
          {showNoResults && (
            <CommandEmpty className="cp-empty">
              <Search size={32} className="cp-empty-icon" />
              <span>No results found for '<strong>{query}</strong>'</span>
            </CommandEmpty>
          )}

          {/* Recent Tasks (when query is empty) */}
          {showRecent && (
            <CommandGroup heading="Recent" className="cp-group">
              {recentTasks.map((recent) => (
                <CommandItem
                  key={`recent-${recent.id}`}
                  value={`recent-${recent.id}-${recent.title}`}
                  onSelect={() => handleSelectRecent(recent)}
                  className="cp-task-item"
                >
                  <Clock size={14} className="cp-recent-icon" />
                  <div className="cp-task-info">
                    <span className="cp-task-title">{recent.title}</span>
                    {(recent.identifier || recent.workspaceName) && (
                      <span className="cp-task-meta">
                        {recent.identifier && <span>{recent.identifier}</span>}
                        {recent.identifier && recent.workspaceName && <span className="cp-task-meta-sep">·</span>}
                        {recent.workspaceName && <span>{recent.workspaceName}</span>}
                      </span>
                    )}
                  </div>
                  <StatusDot status={recent.status || 'todo'} />
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {/* Placeholder (no query, no recents) */}
          {showPlaceholder && (
            <div className="cp-placeholder">
              <Search size={32} className="cp-placeholder-icon" />
              <span className="cp-placeholder-text">Search tasks, members...</span>
              <span className="cp-placeholder-hint">
                Type to search or press <kbd className="cp-kbd-inline">↑</kbd> <kbd className="cp-kbd-inline">↓</kbd> to navigate
              </span>
            </div>
          )}

          {/* Grouped Member Search Results */}
          {!loading && hasQuery && memberResults.length > 0 && (
            <CommandGroup heading="Members" className="cp-group">
              {memberResults.map((member) => (
                <MemberResultItem
                  key={member._id}
                  member={member}
                  onSelect={handleSelectMember}
                />
              ))}
            </CommandGroup>
          )}

          {/* Grouped Task Search Results */}
          {!loading && hasQuery && statusGroups.length > 0 && (
            <CommandGroup heading="Tasks" className="cp-group">
              {statusGroups.map((group) => (
                <div key={group.status}>
                  {/* We don't render a sub-heading per status to keep UI clean and just mix them under Tasks,
                      but if we want them separated by status we can do nested loops. 
                      Given the requirement is just "Tasks", we'll just render all tasks here. */}
                  {group.tasks.map((task) => (
                    <TaskResultItem
                      key={task._id}
                      task={task}
                      onSelect={handleSelectTask}
                    />
                  ))}
                </div>
              ))}
            </CommandGroup>
          )}
        </CommandList>

        {/* Footer with keyboard hints */}
        {(hasQuery || showRecent) && (
          <>
            <CommandSeparator />
            <div className="cp-footer">
              <div className="cp-footer-hints">
                <span className="cp-footer-hint">
                  <kbd className="cp-kbd-inline">↑↓</kbd> Navigate
                </span>
                <span className="cp-footer-hint">
                  <kbd className="cp-kbd-inline">↵</kbd> Open
                </span>
                <span className="cp-footer-hint">
                  <kbd className="cp-kbd-inline">Esc</kbd> Close
                </span>
              </div>
              {hasQuery && totalResults > 0 && (
                <span className="cp-footer-count">
                  {totalResults} result{totalResults !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </>
        )}
      </Command>
    </CommandDialog>
  );
}
