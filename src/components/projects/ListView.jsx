import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { MoreHorizontal, ArrowUpDown, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';

export function ListView({ tasks, onEditTask, onDeleteTask }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedTasks = React.useMemo(() => {
    let sortableTasks = [...tasks];
    if (sortConfig.key !== null) {
      sortableTasks.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle nested or special properties
        if (sortConfig.key === 'assignee') {
          aValue = a.assignedTo?.name || '';
          bValue = b.assignedTo?.name || '';
        } else if (sortConfig.key === 'category') {
          aValue = a.ai?.category || '';
          bValue = b.ai?.category || '';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTasks;
  }, [tasks, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getPriorityColor = (priority) => {
    if (priority >= 7) return 'text-red-600 dark:text-red-400 font-medium';
    if (priority >= 4) return 'text-amber-600 dark:text-amber-400 font-medium';
    return 'text-blue-600 dark:text-blue-400 font-medium';
  };

  const SortableHeader = ({ columnKey, children }) => (
    <div 
      className="flex items-center gap-1 cursor-pointer hover:text-foreground"
      onClick={() => requestSort(columnKey)}
    >
      {children}
      <ArrowUpDown size={12} className={sortConfig.key === columnKey ? "opacity-100" : "opacity-30"} />
    </div>
  );

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">
              <Checkbox />
            </TableHead>
            <TableHead><SortableHeader columnKey="title">Title</SortableHeader></TableHead>
            <TableHead><SortableHeader columnKey="status">Status</SortableHeader></TableHead>
            <TableHead><SortableHeader columnKey="priority">Priority</SortableHeader></TableHead>
            <TableHead><SortableHeader columnKey="category">Category</SortableHeader></TableHead>
            <TableHead><SortableHeader columnKey="assignee">Assignee</SortableHeader></TableHead>
            <TableHead><SortableHeader columnKey="dueDate">Due Date</SortableHeader></TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : (
            sortedTasks.map(task => (
              <TableRow key={task._id || task.id}>
                <TableCell className="text-center">
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium">
                  {task.title}
                </TableCell>
                <TableCell>
                  <span className="capitalize text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {task.status?.replace('-', ' ')}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={getPriorityColor(task.priority)}>
                    P{task.priority || 1}
                  </span>
                </TableCell>
                <TableCell>
                  {task.ai?.category && (
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                      {task.ai.category}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {task.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                        {task.assignedTo.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm">{task.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditTask(task._id || task.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Task
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteTask(task._id || task.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
