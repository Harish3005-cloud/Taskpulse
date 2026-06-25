/**
 * FilterBar — pill-style tab filters like Linear's "All Issues | Active | Backlog".
 * tabs: [{ key, label, count? }]
 */
export default function FilterBar({ tabs, activeTab, onChange, className = '' }) {
  return (
    <div className={`tp-filter-bar ${className}`}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          className={`tp-filter-pill ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          {tab.count != null && <span className="tp-filter-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}
