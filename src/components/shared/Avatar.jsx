/**
 * Avatar component — renders user initial or image.
 * Matches Linear's avatar style.
 */
export default function Avatar({ name, size = 24, color, className = '' }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';

  const COLORS = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #ef4444, #f97316)',
    'linear-gradient(135deg, #22c55e, #10b981)',
    'linear-gradient(135deg, #f59e0b, #eab308)',
    'linear-gradient(135deg, #ec4899, #f43f5e)',
    'linear-gradient(135deg, #3b82f6, #06b6d4)',
  ];

  // Deterministic color from name
  const colorIndex = name ? name.charCodeAt(0) % COLORS.length : 0;
  const bg = color || COLORS[colorIndex];

  return (
    <div
      className={`tp-avatar ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        background: bg,
        borderRadius: size <= 20 ? 4 : size <= 28 ? 6 : '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(size * 0.4, 9),
        fontWeight: 600,
        color: '#fff',
        userSelect: 'none',
        flexShrink: 0,
      }}
      title={name}
    >
      {initial}
    </div>
  );
}
