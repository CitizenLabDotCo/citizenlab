import { Multiloc } from 'typings';

export interface ITextingCampaignData {
  id: string;
  attributes: {
    body_multiloc: Multiloc;
    status: string;
    sent_at: string;
    phone_numbers: number[];
  };
}
