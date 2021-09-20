import {
  IDestination,
  TCategory,
} from 'components/ConsentManager/destinations';
import Cookies from 'js-cookie';

const COOKIE_NAME = 'cl2_consent';

export type ISavedDestinations = {
  [key in IDestination]?: boolean | undefined;
};
export interface IConsentCookie extends Partial<Record<TCategory, boolean>> {
  savedChoices: ISavedDestinations;
}

export function getConsent(): IConsentCookie | null {
  try {
    const json = Cookies.get(COOKIE_NAME);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    return null;
  }
}

export function setConsent(consent: IConsentCookie) {
  JSON.stringify(consent);
  Cookies.set(COOKIE_NAME, consent, { expires: 60 });
}

export function removeConsent() {
  Cookies.remove(COOKIE_NAME, { expires: 60 });
}
