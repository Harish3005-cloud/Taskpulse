/**
 * TaskPriorityBadge — bar-style priority indicator matching Linear's pattern.
 */
export default function TaskPriorityBadge({ priority, showLabel = false }) {
  const config = getPriorityConfig(priority);

  return (
    <span className={`tp-priority-icon ${config.key}`} title={config.label}>
      {/* 4 bars, filled based on priority level */}
      {[1, 2, 3, 4].map(i => (
        <span
          key={i}
          className="tp-priority-bar"
          style={{
            height: 4 + i * 2,
            opacity: i <= config.bars ? 1 : 0.15,
          }}
        />
      ))}
      {showLabel && <span style={{ marginLeft: 4, fontSize: 12 }}>{config.label}</span>}
    </span>
  );
}

export function getPriorityConfig(priority) {
  if (priority >= 5) return { key: 'urgent', label: 'Urgent', bars: 4 };
  if (priority >= 4) return { key: 'high', label: 'High', bars: 3 };
  if (priority >= 3) return { key: 'medium', label: 'Medium', bars: 2 };
  if (priority >= 2) return { key: 'low', label: 'Low', bars: 1 };
  return { key: 'none', label: 'No priority', bars: 0 };
}
