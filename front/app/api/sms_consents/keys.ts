import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'sms_consent',
};

const smsConsentKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default smsConsentKeys;
