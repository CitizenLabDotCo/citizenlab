import {
  IDestination,
  TCategory,
} from 'components/ConsentManager/destinations';
import { get, set, remove } from 'js-cookie';

const COOKIE_NAME = 'cl2_consent';

export type ISavedDestinations = {
  [key in IDestination]?: boolean | undefined;
};
export interface IConsentCookie extends Partial<Record<TCategory, boolean>> {
  savedChoices: ISavedDestinations;
}

export function getConsent(): IConsentCookie | null {
  try {
    const json = get(COOKIE_NAME);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    return null;
  }
}

export function setConsent(consent: IConsentCookie) {
  JSON.stringify(consent);
  set(COOKIE_NAME, consent, { expires: 60 });
}

export function removeConsent() {
  remove(COOKIE_NAME, { expires: 60 });
}
