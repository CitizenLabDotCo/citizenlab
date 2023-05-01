import { ILinks, Multiloc } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import campaignConsentKeys from './keys';

export type CampaignConsentKeys = Keys<typeof campaignConsentKeys>;

export interface IConsentData {
  id: string;
  type: string;
  attributes: {
    campaign_name: string;
    campaign_type_description_multiloc: Multiloc;
    recipient_role_multiloc: Multiloc;
    content_type_multiloc: Multiloc;
    consented: boolean;
  };
}

export interface ICampaignConsents {
  data: IConsentData[];
  links: ILinks;
}

export interface IConsent {
  data: IConsentData;
}
