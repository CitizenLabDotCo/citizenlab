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

export function clickSocialSharingLink(href: string) {
  // https://stackoverflow.com/a/8944769
  const a = document.createElement('a');
  a.href = href;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
}
