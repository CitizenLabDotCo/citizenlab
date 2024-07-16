import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'map_config' };

const mapConfigKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({
    projectId,
    mapConfigId,
  }: {
    projectId?: string | null;
    mapConfigId?: string | null;
  }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { projectId, mapConfigId },
    },
  ],
} satisfies QueryKeys;

export default mapConfigKeys;
