import { IAppConfiguration, IAppConfigurationData } from 'services/appConfiguration';
import { BehaviorSubject } from 'rxjs';

const getAppConfiguration = (): IAppConfiguration => ({
  data: getAppConfigurationData()
});

export const getAppConfigurationData = (attributes = {}): IAppConfigurationData => ({
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
            en: 'Wonderville'
          },
          organization_type: 'medium_city',
          organization_site: 'https://www.wonder.ville',
          lifecycle_stage: 'active',
          color_main: '#225522',
          color_secondary: '#551122',
          color_text: '#222222',
          currency: 'EUR',
          segment_destinations_blacklist: null
        },
        participatory_budgeting: {
          allowed: true,
          enabled: true,
        }
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

export const __setMockAppConfiguration = (appConfiguration: IAppConfiguration) => {
  mockAppConfiguration = appConfiguration;
};

export const currentAppConfigurationStream = jest.fn(() => {
  const observable = new BehaviorSubject(mockAppConfiguration);
  return {
    observable
  };
});
