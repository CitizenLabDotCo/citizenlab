import { useMemo } from 'react';

// hooks
import useProjectById from '../api/projects/useProjectById';
import usePhases from '../api/phases/usePhase';

export default function usePostManagerColumnFilter(
  selectedProjectId?: string | null,
  selectedPhaseId?: string | null
) {
  const project = useProjectById(
    selectedProjectId === undefined ? null : selectedProjectId
  );
  const phase = usePhases(
    selectedPhaseId === undefined ? null : selectedPhaseId
  );

  const displayColumns = useMemo(() => {
    const attributes = selectedPhaseId
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
            'participants',
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
  }, [selectedPhaseId, project, phase]);

  return displayColumns;
}
