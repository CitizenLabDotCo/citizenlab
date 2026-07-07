import { QueryKeys } from 'utils/cl-react-query/types';

import { IEmailDeliveriesParameters } from './types';

const baseKey = {
  type: 'email_campaign_delivery',
};

const emailCampaignDeliveriesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: IEmailDeliveriesParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default emailCampaignDeliveriesKeys;
