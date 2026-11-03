import { QueryKeys } from 'utils/cl-react-query/types';

import { SmsCampaignsQueryParameters } from './types';

const baseKey = { type: 'sms_campaign' };

const smsCampaignsKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: SmsCampaignsQueryParameters) => [
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

export default smsCampaignsKeys;
