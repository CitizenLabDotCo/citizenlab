import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';

const CATEGORIES = [
  'own',
  'official',
  'weekly',
  'mention',
  'commented',
  'voted',
  'admin',
];

export interface IConsentData {
  id: string;
  type: string;
  attributes: {
    campaign_name: string;
    campaign_type_description_multiloc: Multiloc;
    consented: boolean;
    category:
      | 'own'
      | 'official'
      | 'weekly'
      | 'mention'
      | 'commented'
      | 'voted'
      | 'admin';
  };
}

interface ILinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface IConsents {
  data: IConsentData[];
  links: ILinks;
}

export interface IConsent {
  data: IConsentData;
}

export function getCategorizedConsents(consents: IConsentData[]) {
  const res = {} as { [category: string]: IConsentData[] };
  CATEGORIES.forEach((category) => {
    const categoryConsents = consents.filter(
      (consent) => consent.attributes.category === category
    );
    if (categoryConsents.length > 0) {
      res[category] = categoryConsents;
    }
  });
  return res;
}

export function consentsStream() {
  return streams.get<IConsents>({ apiEndpoint: `${API_PATH}/consents` });
}

export function updateConsent(consentId: string, consented: boolean) {
  return streams.update<IConsent>(
    `${API_PATH}/consents/${consentId}`,
    consentId,
    { consent: { consented } }
  );
}
export function updateConsentWithToken(
  consentId: string,
  consented: boolean,
  token: string
) {
  return streams.update<IConsent>(
    `${API_PATH}/consents/${consentId}?unsubscription_token=${token}`,
    consentId,
    { consent: { consented } }
  );
}

export function updateConsentByCampaignIDWithToken(
  campaignId: string,
  consented: boolean,
  token: string
) {
  return streams.update<IConsent>(
    `${API_PATH}/consents/by_campaign_id/${campaignId}`,
    campaignId,
    { consent: { consented }, unsubscription_token: token }
  );
}

export function consentsWithTokenStream(token: string) {
  return streams.get<IConsents>({
    apiEndpoint: `${API_PATH}/consents?unsubscription_token=${token}`,
  });
}
