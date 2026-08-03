import { QueryKeys } from 'utils/cl-react-query/types';

import { PhasePlacementFilter } from './types';

const baseKey = { type: 'phase' };

const phasesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({
    projectId,
    placementType,
  }: {
    projectId: string | undefined;
    placementType?: PhasePlacementFilter;
  }) => [
    {
      ...baseKey,
      operation: 'list',
      parameters: placementType ? { projectId, placementType } : { projectId },
    },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ phaseId }: { phaseId: string | undefined | null }) => [
    { ...baseKey, operation: 'item', parameters: { id: phaseId } },
  ],
} satisfies QueryKeys;

export default phasesKeys;
