import { ILinks, Multiloc } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import campaignConsentKeys from './keys';

export type CampaignConsentKeys = Keys<typeof campaignConsentKeys>;

export interface ICampaignConsentData {
  id: string;
  type: 'consent';
  attributes: {
    campaign_name: string;
    campaign_type_description_multiloc: Multiloc;
    content_type_multiloc: Multiloc;
    consented: boolean;
  };
}

export interface ICampaignConsents {
  data: ICampaignConsentData[];
  links: ILinks;
}

export interface ICampaignConsent {
  data: ICampaignConsentData;
}

export interface IUpdateCampaignConsentObject {
  consentChanges: IConsentChanges[];
  unsubscriptionToken?: string;
}

export interface IConsentChanges {
  campaignConsentId: string;
  consented: boolean;
}
