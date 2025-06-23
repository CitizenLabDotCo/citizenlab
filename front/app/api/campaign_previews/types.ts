import { Keys } from 'utils/cl-react-query/types';
import campaignPreviewsKeys from './keys';

export interface ICampaignPreview {
  data: ICampaignPreviewData;
}

export interface ICampaignPreviewData {
  id: string;
  type: string;
  attributes: {
    html: string;
    subject: string;
  };
}

export type CampaignPreviewsKeys = Keys<typeof campaignPreviewsKeys>;
