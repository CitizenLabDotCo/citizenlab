import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'default_input_topic' };

const defaultInputTopicsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: () => [{ ...baseKey, operation: 'list', parameters: {} }],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default defaultInputTopicsKeys;
