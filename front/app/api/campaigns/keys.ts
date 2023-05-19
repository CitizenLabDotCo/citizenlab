import { QueryKeys } from 'utils/cl-react-query/types';
import { QueryProps } from './types';

const baseKey = { type: 'campaign' };

const campaignsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: QueryProps) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  item: ({ campaignId }: { campaignId?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { campaignId },
    },
  ],
} satisfies QueryKeys;

export default campaignsKeys;
