import { useState, useEffect } from 'react';
import api from '../api/client';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * Temporary Compatibility Layer for Projects
 * Maps Workspace metadata to a default Project when Project APIs are empty or incomplete.
 */
export function useProjectCompatibility() {
  const { activeWorkspace, workspaces, refreshTrigger } = useWorkspace();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeWorkspace?._id) return;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/projects?workspaceId=${activeWorkspace._id}`);
        let fetchedProjects = res.data.projects || [];

        // Apply Compatibility Layer if no projects exist
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Failed to fetch projects', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [activeWorkspace, refreshTrigger]);

  return { projects, loading };
}
