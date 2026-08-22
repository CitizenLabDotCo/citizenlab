import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'sms_balance',
};

const smsBalanceKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default smsBalanceKeys;
