import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'job' };

const inputsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: { phaseId: string }) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: { id: string }) => [
    { ...baseKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default inputsKeys;
