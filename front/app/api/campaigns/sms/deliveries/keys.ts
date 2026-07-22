import { QueryKeys } from 'utils/cl-react-query/types';

import { ISmsDeliveriesParameters } from './types';

const baseKey = {
  type: 'sms_campaign_delivery',
};

const smsCampaignDeliveriesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: ISmsDeliveriesParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default smsCampaignDeliveriesKeys;
