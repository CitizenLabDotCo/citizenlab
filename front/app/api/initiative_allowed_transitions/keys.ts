import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'allowed_transitions', variant: 'initiative' };

const initiativeAllowedTransitionsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    { ...baseKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default initiativeAllowedTransitionsKeys;
