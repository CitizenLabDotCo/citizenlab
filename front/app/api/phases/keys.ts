import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'phase' };

const phasesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: ({ projectId }: { projectId: string }) => [
    { ...baseKey, operation: 'list', parameters: { projectId } },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ phaseId }: { phaseId: string | undefined }) => [
    { ...baseKey, operation: 'item', parameters: { phaseId } },
  ],
} satisfies QueryKeys;

export default phasesKeys;
