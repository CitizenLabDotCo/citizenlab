import { Keys } from 'utils/cl-react-query/types';

import campaignPreviewsKeys from './keys';

export type CampaignPreviewsKeys = Keys<typeof campaignPreviewsKeys>;

export interface ICampaignPreview {
  data: ICampaignPreviewData;
}

export interface ICampaignPreviewData {
  id: string;
  type: string;
  attributes: {
    to: string;
    from: string;
    reply_to: string;
    subject: string;
    html: string;
  };
}
