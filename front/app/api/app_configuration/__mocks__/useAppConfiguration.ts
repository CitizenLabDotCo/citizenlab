import { IAppConfigurationData } from 'api/app_configuration/types';

export const appConfigurationData: IAppConfigurationData = {
  id: 'c4b400e1-1786-5be2-af55-40730c6a843d',
  type: 'app_configuration',
  attributes: {
    name: 'wonderville',
    host: 'wonderville.com',
    created_at: '',
    country_code: 'BE',
    settings: {
      core: {
        allowed: true,
        enabled: true,
        locales: ['en'],
        population: 12500,
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
        authentication_token_lifetime_in_days: 30,
        maximum_admins_number: 4,
        maximum_moderators_number: 4,
        additional_admins_number: 4,
        additional_moderators_number: 4,
        allow_sharing: true,
        private_attributes_in_export: true,
      },
      advanced_custom_pages: {
        allowed: true,
        enabled: true,
      },
      pages: {
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
  },
};

export default jest.fn(() => {
  return { data: { data: appConfigurationData } };
});
