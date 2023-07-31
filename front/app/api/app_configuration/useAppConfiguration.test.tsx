import { renderHook } from '@testing-library/react-hooks';

import useAppConfiguration from './useAppConfiguration';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { IAppConfigurationData } from './types';

jest.unmock('./useAppConfiguration');

export const getAppConfigurationData = (
  attributes = {}
): IAppConfigurationData => ({
  id: 'c4b400e1-1786-5be2-af55-40730c6a843d',
  type: 'app_configuration',
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
        authentication_token_lifetime_in_days: 30,
        maximum_admins_number: 12,
        maximum_moderators_number: 14,
        additional_admins_number: 0,
        additional_moderators_number: 0,
      },
      advanced_custom_pages: {
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
const server = setupServer(
  rest.get('*app_configuration', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: getAppConfigurationData() }));
  })
);

describe('useAppConfiguration', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAppConfiguration(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(getAppConfigurationData());
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get('*app_configuration', (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAppConfiguration(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
