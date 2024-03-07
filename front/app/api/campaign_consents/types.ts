import { ILinks, Multiloc } from 'typings';

import { CampaignName } from 'api/campaigns/types';

import { Keys } from 'utils/cl-react-query/types';

import campaignConsentKeys from './keys';

export type CampaignConsentKeys = Keys<typeof campaignConsentKeys>;

export interface ICampaignConsentData {
  id: string;
  type: 'consent';
  attributes: ICampaignConsentAttributes;
}

export interface ICampaignConsentAttributes {
  campaign_name: CampaignName;
  content_type_ordering: number;
  campaign_type_description_multiloc: Multiloc;
  content_type_multiloc: Multiloc;
  consented: boolean;
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
  campaignConsentId?: string;
  campaignId?: string;
  consented: boolean;
}

export interface IConsentsRequestData {
  withoutCampaignNames?: CampaignName[];
  unsubscriptionToken?: string | null;
}
