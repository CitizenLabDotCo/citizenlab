import { useMemo } from 'react';

// hooks
import usePhases from '../api/phases/usePhase';

export default function usePostManagerColumnFilter(
  selectedPhaseId?: string | null
) {
  const phase = usePhases(
    selectedPhaseId === undefined ? null : selectedPhaseId
  );

  const displayColumns = useMemo(() => {
    const attributes = phase.data?.data.attributes;
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
  }, [phase]);

  return displayColumns;
}
