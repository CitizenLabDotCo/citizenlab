import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'campaign_consent',
};

const campaignConsentKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default campaignConsentKeys;
