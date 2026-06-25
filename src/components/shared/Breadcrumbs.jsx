import { Link } from 'react-router-dom';

/**
 * Breadcrumbs component — matches Linear's breadcrumb bar.
 * items: [{ label, to, icon? }]
 */
export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="tp-breadcrumbs">
      {items.map((item, i) => (
        <span key={i} className="tp-breadcrumb-item">
          {i > 0 && <span className="tp-breadcrumb-sep">›</span>}
          {item.icon && <span className="tp-breadcrumb-icon">{item.icon}</span>}
          {item.to ? (
            <Link to={item.to} className="tp-breadcrumb-link">{item.label}</Link>
          ) : (
            <span className="tp-breadcrumb-current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
