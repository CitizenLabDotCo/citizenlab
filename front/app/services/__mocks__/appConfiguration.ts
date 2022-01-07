import {
  IAppConfiguration,
  IAppConfigurationData,
} from 'services/appConfiguration';
import { BehaviorSubject } from 'rxjs';

export const getAppConfiguration = (): IAppConfiguration => ({
  data: getAppConfigurationData(),
});

export const getAppConfigurationData = (
  attributes = {}
): IAppConfigurationData => ({
  id: 'c4b400e1-1786-5be2-af55-40730c6a843d',
  type: 'tenant',
  attributes: {
    name: 'wonderville',
    host: 'wonderville.com',
    settings: {
      core: {
        allowed: true,
        enabled: true,
        locales: ['en'],
        timezone: 'Europe/Brussels',
        organization_name: {
          en: 'Wonderville',
        },
        organization_type: 'medium_city',
        organization_site: 'https://www.wonder.ville',
        lifecycle_stage: 'active',
        color_main: '#225522',
        color_secondary: '#551122',
        color_text: '#222222',
        currency: 'EUR',
        segment_destinations_blacklist: null,
        reply_to_email: 'not-support@citizenlab.co',
        display_header_avatars: true,
      },
      customizable_homepage_banner: {
        allowed: true,
        enabled: true,
        layout: 'full_width_banner_layout',
        cta_signed_out_type: 'sign_up_button',
        cta_signed_out_customized_button: {
          text: { en: 'Click' },
          url: 'https://www.wonder.ville/promo',
        },
        cta_signed_in_type: 'no_button',
        cta_signed_in_customized_button: {
          text: { en: 'Click' },
          url: 'https://www.wonder.ville/promo2',
        },
      },
      participatory_budgeting: {
        allowed: true,
        enabled: true,
      },
      custom_accessibility_statement_link: {
        allowed: false,
        enabled: false,
      },
    },
    logo: {
      small: 'http://zah.cy/wof.jpg',
      medium: 'http://fepe.et/fivacsok.jpg',
      large: 'http://jostoska.gt/timihosin.jpg',
    },
    header_bg: {
      small: 'http://neena.gr/owocap.jpg',
      medium: 'http://hedopewa.mw/ra.jpg',
      large: 'http://sarmuvov.co/uzro.jpg',
    },
    ...attributes,
  },
});

let mockAppConfiguration: IAppConfiguration = getAppConfiguration();

export const __setMockAppConfiguration = (
  appConfiguration: IAppConfiguration
) => {
  mockAppConfiguration = appConfiguration;
};

export const currentAppConfigurationStream = jest.fn(() => {
  const observable = new BehaviorSubject(mockAppConfiguration);
  return {
    observable,
  };
});
