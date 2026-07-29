import { QueryKeys } from 'utils/cl-react-query/types';

import { EmailCampaignsQueryParameters } from './types';

const baseKey = { type: 'email_campaign' };

const emailCampaignsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: EmailCampaignsQueryParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
  item: ({ campaignId }: { campaignId: string | null }) => [
    {
      ...baseKey,
      operation: 'item',
      parameters: { id: campaignId },
    },
  ],
} satisfies QueryKeys;

export default emailCampaignsKeys;
