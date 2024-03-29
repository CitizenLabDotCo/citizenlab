import { Keys } from 'utils/cl-react-query/types';

import textingCampaignsKeys from './keys';

export type TextingCampaignsKeys = Keys<typeof textingCampaignsKeys>;

export type TTextingCampaignStatus = 'draft' | 'sending' | 'sent' | 'failed';

export interface ITextingCampaignData {
  id: string;
  type: 'campaign';
  attributes: {
    message: string;
    status: TTextingCampaignStatus;
    sent_at: string | null;
    created_at: string;
    updated_at: string;
    phone_numbers: string[];
  };
}

export interface ITextingCampaign {
  data: ITextingCampaignData;
}

export interface ITextingCampaigns {
  data: ITextingCampaignData[];
}
