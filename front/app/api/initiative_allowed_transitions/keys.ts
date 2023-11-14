import { QueryKeys } from 'utils/cl-react-query/types';

const itemKey = { type: 'allowed_transitions' };
const baseKey = { type: 'allowed_transitions', variant: 'initiative' };

const initiativeAllowedTransitionsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    { ...itemKey, operation: 'item', parameters: { id } },
  ],
} satisfies QueryKeys;

export default initiativeAllowedTransitionsKeys;
