import { QueryKeys } from 'utils/cl-react-query/types';

import { PhasePlacementType } from './types';

const baseKey = { type: 'phase' };

const phasesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({
    projectId,
    placementType,
  }: {
    projectId: string | undefined;
    placementType?: PhasePlacementType | 'all';
  }) => [
    {
      ...baseKey,
      operation: 'list',
      // Only include placementType when set, so invalidating with
      // `list({ projectId })` partially matches every placement variant.
      parameters: placementType ? { projectId, placementType } : { projectId },
    },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ phaseId }: { phaseId: string | undefined | null }) => [
    { ...baseKey, operation: 'item', parameters: { id: phaseId } },
  ],
} satisfies QueryKeys;

export default phasesKeys;
