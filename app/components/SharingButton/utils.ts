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

export function addUtmToUrl(medium: Medium, url: string, utmParams: UtmParams) {
  let resUrl = url;

  resUrl += `?utm_source=${utmParams.source}&utm_campaign=${utmParams.campaign}&utm_medium=${medium}`;

  if (utmParams.content) {
    resUrl += `&utm_content=${utmParams.content}`;
  }

  return resUrl;
}
