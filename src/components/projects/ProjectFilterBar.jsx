import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Button, buttonVariants } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';

export function ProjectFilterBar({ filters, updateFilter, resetFilters, members = [] }) {
  const hasActiveFilters = Object.values(filters).some(val => val !== 'all' && val !== 'any' && val !== null);

  return (
    <div className="tp-projects-filters">
      {/* Status Filter */}
      <div className="flex flex-col gap-1.5 w-40">
        <label className="text-xs font-medium text-muted-foreground">Status</label>
        <Select value={filters.status} onValueChange={(val) => updateFilter('status', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority Filter */}
      <div className="flex flex-col gap-1.5 w-40">
        <label className="text-xs font-medium text-muted-foreground">Priority</label>
        <Select value={filters.priority} onValueChange={(val) => updateFilter('priority', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Priority</SelectItem>
            <SelectItem value="high">High (7-10)</SelectItem>
            <SelectItem value="medium">Medium (4-6)</SelectItem>
            <SelectItem value="low">Low (1-3)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col gap-1.5 w-40">
        <label className="text-xs font-medium text-muted-foreground">Category</label>
        <Select value={filters.category} onValueChange={(val) => updateFilter('category', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Category</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="chore">Chore</SelectItem>
            <SelectItem value="research">Research</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignee Filter */}
      <div className="flex flex-col gap-1.5 w-48">
        <label className="text-xs font-medium text-muted-foreground">Assignee</label>
        <Select value={filters.assignee} onValueChange={(val) => updateFilter('assignee', val)}>
          <SelectTrigger>
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Anyone</SelectItem>
            {members.map(member => (
              <SelectItem key={member?.user?._id || member?.id || 'unknown'} value={member?.user?._id || member?.id || 'unknown'}>
                {member?.user?.name || member?.name || 'Unknown User'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>



      {/* Clear All Button */}
      {hasActiveFilters && (
        <div className="flex flex-col gap-1.5 mt-auto ml-auto">
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground h-10 px-4">
            <X className="w-4 h-4 mr-2" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
