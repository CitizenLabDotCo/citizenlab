import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'campaign' };

const campaignsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  item: ({ campaignId }: { campaignId?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { campaignId },
    },
  ],
} satisfies QueryKeys;

export default campaignsKeys;
