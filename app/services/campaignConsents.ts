import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export interface IConsentData {
  id: string;
  type: string;
  attributes: {
    campaign_type: string;
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

export function updateConsent(userId: string, consentId: string, object) {
  return streams.update<IConsent>(`${API_PATH}/users/${userId}/consents/${consentId}`, consentId, { consent: object });
}
