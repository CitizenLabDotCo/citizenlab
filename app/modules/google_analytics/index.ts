import {
  IDestinationConfig,
  registerDestination,
} from 'components/ConsentManager/destinations';
import { initializeFor } from 'utils/analytics';

declare module 'components/ConsentManager/destinations' {
  export interface IDestinationMap {
    google_analytics: 'google_analytics';
  }
}

const destinationConfig: IDestinationConfig = {
  key: 'google_analytics',
  category: 'analytics',
  feature_flag: 'google_analytics',
  name: () => 'Google Analytics',
};

registerDestination(destinationConfig);

initializeFor('google_analytics').subscribe(() => {
  const script = document.createElement('script');
  const parent = document.getElementsByTagName('script')[0].parentNode;
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=UA-101738826-16';
  parent?.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer?.push(arguments);
  }
  // @ts-ignore
  gtag('js', new Date());
  // @ts-ignore
  gtag('config', 'UA-101738826-16');
});
