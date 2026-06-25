import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import api from '../api/client';

export function useProjectFilters(workspaceId, projectId, viewId) {
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'any',
    category: 'any',
    assignee: 'any',
    dateFrom: null,
    dateTo: null
  });

  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const debouncedFilters = useDebounce(filters, 200);

  // Fetch members
  useEffect(() => {
    if (!workspaceId) return;
    const fetchMembers = async () => {
      try {
        const res = await api.get(`/workspaces/${workspaceId}/members`);
        if (res?.data?.members) {
          setMembers(res.data.members);
        }
      } catch (err) {
        console.error('Failed to fetch members:', err);
      }
    };
    fetchMembers();
  }, [workspaceId]);

  // Fetch View Filters if viewId is present
  useEffect(() => {
    if (!workspaceId || !viewId) return;
    // In a real implementation, you would fetch the view config here
    // and call setFilters(fetchedFilters). For now we just reset.
  }, [workspaceId, viewId]);

  // Fetch Tasks
  const fetchTasks = useCallback(async (isLoadMore = false) => {
    if (!workspaceId) return;
    try {
      const currentOffset = isLoadMore ? offset + limit : 0;
      setLoading(true);

      const params = {
        workspaceId,
        limit,
        page: (currentOffset / limit) + 1,
      };

      if (projectId) params.projectId = projectId;

      if (debouncedFilters.status !== 'all') params.status = debouncedFilters.status;
      if (debouncedFilters.priority !== 'any') params.priority = debouncedFilters.priority;
      if (debouncedFilters.category !== 'any') params.category = debouncedFilters.category;
      if (debouncedFilters.assignee !== 'any') params.assignedTo = debouncedFilters.assignee;
      if (debouncedFilters.dateFrom) params.from = debouncedFilters.dateFrom.toISOString();
      if (debouncedFilters.dateTo) params.to = debouncedFilters.dateTo.toISOString();

      const res = await api.get('/tasks', { params });
      
      if (res?.data?.success) {
        if (isLoadMore) {
          setTasks(prev => [...prev, ...res.data.tasks]);
        } else {
          setTasks(res.data.tasks);
        }
        setTotal(res.data.total);
        if (!isLoadMore) {
          setOffset(0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, debouncedFilters, offset]);

  useEffect(() => {
    fetchTasks(false);
  }, [fetchTasks]);

  const loadMore = () => {
    setOffset(prev => prev + limit);
    fetchTasks(true);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'any',
      category: 'any',
      assignee: 'any',
      dateFrom: null,
      dateTo: null
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    tasks,
    setTasks, // useful for optimistic updates
    members,
    loading,
    total,
    hasMore: tasks.length < total,
    loadMore,
    fetchTasks
  };
}
