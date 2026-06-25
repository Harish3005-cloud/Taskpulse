/**
 * Empty state component — centered illustration + message + CTA.
 * Matches Linear's empty state pattern.
 */
export default function EmptyState({ icon, title, description, actionLabel, onAction, children }) {
  return (
    <div className="tp-empty-state">
      {icon && <div className="tp-empty-state-icon">{icon}</div>}
      {title && <h3 className="tp-empty-state-title">{title}</h3>}
      {description && <p className="tp-empty-state-desc">{description}</p>}
      {actionLabel && onAction && (
        <button className="tp-empty-state-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  );
}
