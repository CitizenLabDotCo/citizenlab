import { useMemo } from 'react';

// hooks
import useProjectById from '../api/projects/useProjectById';
import usePhases from '../api/phases/usePhase';

export default function usePostManagerColumnFilter(
  selectedProject?: string | null,
  selectedPhase?: string | null
) {
  const project = useProjectById(
    selectedProject === undefined ? null : selectedProject
  );
  const phase = usePhases(selectedPhase === undefined ? null : selectedPhase);

  const displayColumns = useMemo(() => {
    const attributes = selectedPhase
      ? phase.data?.data.attributes
      : project.data?.data.attributes;
    if (attributes) {
      switch (attributes.voting_method) {
        case 'budgeting':
          return new Set<string>([
            'selection',
            'title',
            'picks',
            'budget',
            'comments',
          ]);
        case 'multiple_voting':
          return new Set<string>([
            'selection',
            'title',
            'votes',
            'picks',
            'comments',
          ]);
        case 'single_voting':
          return new Set<string>(['selection', 'title', 'votes', 'comments']);
      }
    }
    // Default columns
    return new Set<string>([
      'selection',
      'title',
      'assignee',
      'comments',
      'up',
      'down',
      'published_on',
    ]);
  }, [project, phase]);

  return displayColumns;
}
