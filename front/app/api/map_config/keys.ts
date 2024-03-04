import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'map_config' };

const mapConfigKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ id }: { id?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id },
    },
  ],
} satisfies QueryKeys;

export default mapConfigKeys;
