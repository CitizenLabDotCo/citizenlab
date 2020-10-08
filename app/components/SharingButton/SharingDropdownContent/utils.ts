import tracks from '../tracks';
import { trackEventByName } from 'utils/analytics';

export type UtmParams = {
  source: string;
  campaign: string;
  content?: string;
};

export type Medium =
  | 'facebook'
  | 'twitter'
  | 'messenger'
  | 'whatsapp'
  | 'email';

export function addUtmToUrl(
  medium: Medium,
  url: string,
  utmParams?: UtmParams
) {
  let resUrl = url;

  if (utmParams) {
    resUrl += `?utm_source=${utmParams.source}&utm_campaign=${utmParams.campaign}&utm_medium=${medium}`;

    if (utmParams.content) {
      resUrl += `&utm_content=${utmParams.content}`;
    }
  }

  return resUrl;
}

export function handleClick(medium: Medium, href?: string) {
  if (href) {
    window.location.href = href;
  }
  trackEventByName(tracks.clickShare.name, { network: medium });
}

export function trackClick(medium: Medium) {
  trackEventByName(tracks.clickShare.name, { network: medium });
}
