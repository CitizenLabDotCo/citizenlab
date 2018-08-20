import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';

export interface IConsentData {
  id: string;
  type: string;
  attributes: {
    campaign_type: string;
    campaign_type_description_multiloc: Multiloc,
    consented: boolean;
  };
}

export interface IConsents {
  data: IConsentData[];
}

export interface IConsent {
  data: IConsentData;
}

export function consentsStream(userId: string) {
  return streams.get<IConsents>({ apiEndpoint: `${API_PATH}/users/${userId}/consents` });
}

export function updateConsent(consentId: string, object) {
  return streams.update<IConsent>(`${API_PATH}/consents/${consentId}`, consentId, { consent: object });
}
