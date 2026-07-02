import { QueryKeys } from 'utils/cl-react-query/types';

import { ICampaignDeliveriesParameters } from './types';

const baseKey = {
  type: 'campaign_delivery',
};

const campaignDeliveriesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: ICampaignDeliveriesParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default campaignDeliveriesKeys;
