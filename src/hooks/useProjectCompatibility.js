import { useState, useEffect } from 'react';
import api from '../api/client';
import { useWorkspace } from '../context/WorkspaceContext';

/**
 * Temporary Compatibility Layer for Projects
 * Maps Workspace metadata to a default Project when Project APIs are empty or incomplete.
 */
export function useProjectCompatibility() {
  const { activeWorkspace, workspaces } = useWorkspace();
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
        if (fetchedProjects.length === 0) {
          fetchedProjects = [
            {
              _id: `mock-project-${activeWorkspace._id}`,
              name: activeWorkspace.name,
              members: activeWorkspace.members || [],
              labels: activeWorkspace.customLabels || [],
              owner: activeWorkspace.createdBy,
              status: 'Active',
              progress: 0,
              taskCount: 0,
              isCompatibilityMock: true
            }
          ];
        }

        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Failed to fetch projects', error);
        
        // Fallback if API completely fails
        setProjects([
          {
            _id: `mock-project-${activeWorkspace._id}`,
            name: activeWorkspace.name || 'Default Project',
            members: activeWorkspace.members || [],
            labels: activeWorkspace.customLabels || [],
            owner: activeWorkspace.createdBy,
            status: 'Active',
            progress: 0,
            taskCount: 0,
            isCompatibilityMock: true
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [activeWorkspace]);

  return { projects, loading };
}
