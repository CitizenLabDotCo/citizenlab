import { QueryKeys } from 'utils/cl-react-query/types';

const baseNetworkKey = { type: 'network' };
const networkKeys = {
  all: () => [baseNetworkKey],
  items: () => [{ ...baseNetworkKey, operation: 'item' }],
  item: ({ viewId }: { viewId: string }) => [
    {
      ...baseNetworkKey,
      operation: 'item',
      parameters: { viewId },
    },
  ],
} satisfies QueryKeys;

const baseNetwordTaskKey = { type: 'text_network_analysis_task' };

const networkTaskKeys = {
  all: () => [baseNetwordTaskKey],
  lists: () => [{ ...baseNetwordTaskKey, operation: 'list' }],
  list: ({ viewId }: { viewId: string }) => [
    {
      ...baseNetwordTaskKey,
      operation: 'list',
      parameters: { viewId },
    },
  ],
} satisfies QueryKeys;

export { networkKeys, networkTaskKeys };
