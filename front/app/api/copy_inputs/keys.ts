import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'job' };

const inputsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: { phaseId: string }) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default inputsKeys;
