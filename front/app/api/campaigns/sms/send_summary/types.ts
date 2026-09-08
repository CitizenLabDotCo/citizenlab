import { Keys } from 'utils/cl-react-query/types';

import smsSendSummaryKeys from './keys';

export type SmsSendSummaryKeys = Keys<typeof smsSendSummaryKeys>;

export interface ISmsSendSummaryAttributes {
  // Phone confirmed, opted in, and in the selected groups.
  recipients_count: number;
  // Counted server-side from the body each recipient's locale resolves to.
  segments_needed: number;
  // Left of the purchased allowance. Negative once a tenant oversends.
  segments_balance: number;
}

export interface ISmsSendSummary {
  data: {
    type: 'sms_send_summary';
    attributes: ISmsSendSummaryAttributes;
  };
}
