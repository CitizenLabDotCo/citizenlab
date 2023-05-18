import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'campaign' };

const campaignsKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: ({ campaignId }: { campaignId?: string }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { campaignId },
    },
  ],
} satisfies QueryKeys;

export default campaignsKeys;
