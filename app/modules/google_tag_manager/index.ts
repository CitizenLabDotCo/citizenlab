import 'components/ConsentManager/destinations';
import { initializeFor } from 'utils/analytics';

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    google_tag_manager: 'google_tag_manager';
  }
}

initializeFor('google_tag_manager').subscribe(() => {
  (function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const f = d.getElementsByTagName(s)[0];
    const j = d.createElement(s) as HTMLScriptElement;
    const dl = l !== 'dataLayer' ? `&l=${l}` : '';
    j.async = true;
    j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
    f.parentNode?.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-KBM5894');
});
