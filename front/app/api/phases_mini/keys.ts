import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'phase_mini' };

const phasesKeys = {
  all: () => [baseKey],
  item: ({ id }: { id?: string }) => [
    { ...baseKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default phasesKeys;
