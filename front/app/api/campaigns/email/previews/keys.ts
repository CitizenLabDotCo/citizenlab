import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'email_campaign_preview' };

const emailCampaignPreviewsKeys = {
  all: () => [baseKey],
  item: ({ campaignId }: { campaignId: string | null }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id: campaignId },
    },
  ],
} satisfies QueryKeys;

export default emailCampaignPreviewsKeys;
