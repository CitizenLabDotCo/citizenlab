import { ILinks, Multiloc } from 'typings';

import { CampaignName } from 'api/campaigns/types';

import { Keys } from 'utils/cl-react-query/types';

import smsConsentKeys from './keys';

export type SmsConsentKeys = Keys<typeof smsConsentKeys>;

export interface ISmsConsentData {
  id: string;
  type: string;
  attributes: {
    campaign_name: CampaignName;
    campaign_type_description_multiloc: Multiloc;
    consented: boolean;
    created_at: string;
    updated_at: string;
  };
}

export interface ISmsConsents {
  data: ISmsConsentData[];
  links: ILinks;
}

export interface ISmsConsent {
  data: ISmsConsentData;
}

export interface ISmsConsentChange {
  smsConsentId: string;
  consented: boolean;
}

export interface IUpdateSmsConsentObject {
  consentChanges: ISmsConsentChange[];
}
