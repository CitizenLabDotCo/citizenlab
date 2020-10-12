import { get, set, remove } from 'js-cookie';
import { IConsentCookie } from '.';

const COOKIE_NAME = 'cl2_consent';

export function getConsent() {
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
