import { QueryKeys } from 'utils/cl-react-query/types';

import { IParameters } from './types';

const baseKey = {
  type: 'campaign_delivery',
};

const campaignDeliveriesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (parameters: IParameters) => [
    { ...baseKey, operation: 'list', parameters },
  ],
} satisfies QueryKeys;

export default campaignDeliveriesKeys;
