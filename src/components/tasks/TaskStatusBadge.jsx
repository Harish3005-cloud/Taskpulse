/**
 * TaskStatusBadge — circular status icon matching Linear's pattern.
 */
export default function TaskStatusBadge({ status, size = 14 }) {
  return (
    <span
      className={`tp-status-icon ${status}`}
      style={{ width: size, height: size }}
      title={formatStatus(status)}
    />
  );
}

export function formatStatus(status) {
  const map = {
    'todo': 'Todo',
    'in-progress': 'In Progress',
    'review': 'In Review',
    'done': 'Done',
    'backlog': 'Backlog',
    'cancelled': 'Cancelled',
  };
  return map[status] || status;
}

export const STATUS_ORDER = ['in-progress', 'todo', 'review', 'done', 'backlog', 'cancelled'];
