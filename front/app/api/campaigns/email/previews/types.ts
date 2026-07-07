import { Keys } from 'utils/cl-react-query/types';

import emailCampaignPreviewsKeys from './keys';

export type EmailCampaignPreviewsKeys = Keys<typeof emailCampaignPreviewsKeys>;

export interface IEmailCampaignPreview {
  data: IEmailCampaignPreviewData;
}

export interface IEmailCampaignPreviewData {
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
