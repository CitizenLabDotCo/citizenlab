export type Medium =
  | 'facebook'
  | 'twitter'
  | 'messenger'
  | 'whatsapp'
  | 'email';

export type UtmParams = {
  source: string;
  campaign: string;
  content?: string;
};

export function getUrlWithUtm(
  medium: Medium,
  url: string,
  utmParams: UtmParams
) {
  let resUrl = url;

  resUrl += `?utm_source=${encodeURIComponent(
    utmParams.source
  )}&utm_campaign=${encodeURIComponent(
    utmParams.campaign
  )}&utm_medium=${encodeURIComponent(medium)}`;

  if (utmParams.content) {
    resUrl += `&utm_content=${encodeURIComponent(utmParams.content)}`;
  }

  return resUrl;
}
