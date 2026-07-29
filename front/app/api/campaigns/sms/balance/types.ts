import { Keys } from 'utils/cl-react-query/types';

import smsBalanceKeys from './keys';

export type SmsBalanceKeys = Keys<typeof smsBalanceKeys>;

export interface ISmsBalanceAttributes {
  // Cumulative number of messages the tenant has ever purchased.
  purchased: number;
  // Messages handed to the SMS provider since the platform started, i.e. billed.
  used: number;
  // purchased - used. Negative when the tenant has sent more than it bought.
  balance: number;
  used_otp: number;
  used_manual: number;
  // Billed sends not attributable to either campaign type, today only previews.
  used_other: number;
}

export interface ISmsBalance {
  data: {
    type: 'sms_balance';
    attributes: ISmsBalanceAttributes;
  };
}
