import { Keys } from 'utils/cl-react-query/types';

import smsCampaignStatsKeys from './keys';

export type SmsCampaignStatsKeys = Keys<typeof smsCampaignStatsKeys>;

// Per-recipient SMS delivery counts (Twilio-tracked). The statuses deliberately
// differ from email.
export interface ISmsDeliveryStats {
  pending: number;
  queued: number;
  sent: number;
  delivered: number;
  undelivered: number;
  failed: number;
  total: number;
}

export interface ISmsCampaignStats {
  data: {
    type: 'stats';
    attributes: ISmsDeliveryStats;
  };
}
