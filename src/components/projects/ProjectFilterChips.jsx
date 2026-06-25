import React from 'react';
import { X } from 'lucide-react';

export function ProjectFilterChips({ filters, updateFilter }) {
  const activeFilters = [];

  if (filters.status !== 'all') {
    activeFilters.push({ key: 'status', label: `Status: ${filters.status}`, resetValue: 'all' });
  }
  if (filters.priority !== 'any') {
    activeFilters.push({ key: 'priority', label: `Priority: ${filters.priority}`, resetValue: 'any' });
  }
  if (filters.category !== 'any') {
    activeFilters.push({ key: 'category', label: `Category: ${filters.category}`, resetValue: 'any' });
  }
  if (filters.assignee !== 'any') {
    activeFilters.push({ key: 'assignee', label: `Assignee: ${filters.assignee}`, resetValue: 'any' });
  }
  if (filters.dateFrom) {
    activeFilters.push({ key: 'dateFrom', label: `From: ${new Date(filters.dateFrom).toLocaleDateString()}`, resetValue: null });
  }
  if (filters.dateTo) {
    activeFilters.push({ key: 'dateTo', label: `To: ${new Date(filters.dateTo).toLocaleDateString()}`, resetValue: null });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="tp-projects-chips">
      {activeFilters.map(filter => (
        <span 
          key={filter.key} 
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground"
        >
          {filter.label}
          <button 
            onClick={() => updateFilter(filter.key, filter.resetValue)}
            className="hover:text-destructive transition-colors focus:outline-none"
            aria-label={`Remove ${filter.key} filter`}
          >
            <X size={14} />
          </button>
        </span>
      ))}
    </div>
  );
}
