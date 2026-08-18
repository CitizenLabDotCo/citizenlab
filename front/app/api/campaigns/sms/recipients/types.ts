import { Keys } from 'utils/cl-react-query/types';

import smsCampaignRecipientsKeys from './keys';

export type SmsCampaignRecipientsKeys = Keys<typeof smsCampaignRecipientsKeys>;

export interface ISmsCampaignRecipientsAttributes {
  // Users a send would reach right now: phone confirmed, opted in, in the
  // selected groups.
  count: number;
  // Those same users per locale. The body is translated per recipient, and the
  // translation decides how many credits that recipient costs.
  count_by_locale: Record<string, number>;
}

export interface ISmsCampaignRecipients {
  data: {
    type: 'sms_recipients';
    attributes: ISmsCampaignRecipientsAttributes;
  };
}
