import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'map_config' };

const mapConfigKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({
    projectId,
    id,
  }: {
    projectId?: string | null;
    id?: string | null;
  }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { projectId, id },
    },
  ],
} satisfies QueryKeys;

export default mapConfigKeys;
