import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'map_config' };

const mapConfigKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ projectId }: { projectId?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { projectId },
    },
  ],
} satisfies QueryKeys;

export default mapConfigKeys;
