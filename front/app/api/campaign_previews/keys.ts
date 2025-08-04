import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'campaign_preview' };

const campaignPreviewsKeys = {
  all: () => [baseKey],
  item: ({ campaignId }: { campaignId: string | null }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id: campaignId },
    },
  ],
} satisfies QueryKeys;

export default campaignPreviewsKeys;
