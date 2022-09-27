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
        weglot_api_key: null,
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
      },
      customizable_homepage_banner: {
        allowed: true,
        enabled: true,
      },
      participatory_budgeting: {
        allowed: true,
        enabled: true,
      },
      custom_accessibility_statement_link: {
        allowed: false,
        enabled: false,
      },
      matomo: {
        allowed: true,
        enabled: true,
        tenant_site_id: '13',
        product_site_id: '14',
      },
    },
    logo: {
      small: 'http://zah.cy/wof.jpg',
      medium: 'http://fepe.et/fivacsok.jpg',
      large: 'http://jostoska.gt/timihosin.jpg',
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

export const currentAppConfigurationEndpoint = '/web_api/v1/app_configuration';
