import { Keys } from 'utils/cl-react-query/types';

import emailCampaignStatsKeys from './keys';

export type EmailCampaignStatsKeys = Keys<typeof emailCampaignStatsKeys>;

export interface IEmailCampaignStats {
  data: {
    type: 'stats';
    attributes: {
      sent: number;
      bounced: number;
      failed: number;
      accepted: number;
      delivered: number;
      opened: number;
      clicked: number;
      total: number;
    };
  };
}
