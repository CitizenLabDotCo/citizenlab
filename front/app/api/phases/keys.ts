import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'phase' };

const phasesKeys = {
  all: () => [baseKey],
  list: ({ projectId }: { projectId: string }) => [
    { ...baseKey, operation: 'list', parameters: { projectId } },
  ],
  item: ({ phaseId }: { phaseId: string }) => [
    { ...baseKey, operation: 'item', parameters: { phaseId } },
  ],
} satisfies QueryKeys;

export default phasesKeys;
