import { Keys } from 'utils/cl-react-query/types';

import campaignStatsKeys from './keys';

export type CampaignStatsKeys = Keys<typeof campaignStatsKeys>;

export interface ICampaignStats {
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
