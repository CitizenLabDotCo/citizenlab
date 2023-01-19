import { getActiveDestinations } from './utils';
import { registerDestination } from './destinations';
import { isAdmin, isModerator } from 'services/permissions/roles';

const mockAppConfiguration = {
  id: '1',
  attributes: {
    settings: {
      matomo: {
        allowed: true,
        enabled: true,
      },
      google_analytics: {
        allowed: true,
        enabled: true,
      },
      intercom: {
        allowed: true,
        enabled: true,
      },
    },
  },
};

const matomoConfig = {
  key: 'matomo',
  category: 'analytics',
  feature_flag: 'matomo',
  name: () => 'Matomo',
} as any;
registerDestination(matomoConfig);

const gaConfig = {
  key: 'google_analytics',
  category: 'analytics',
  feature_flag: 'google_analytics',
  name: () => 'Google Analytics',
} as any;
registerDestination(gaConfig);

const intercomConfig = {
  key: 'intercom',
  category: 'functional',
  feature_flag: 'intercom',
  hasPermission: (user) =>
    !!user && (isAdmin({ data: user }) || isModerator({ data: user })),
  name: () => 'Intercom',
} as any;
registerDestination(intercomConfig);

describe('getActiveDestinations', () => {
  it('works correctly without user', () => {
    const output = getActiveDestinations(mockAppConfiguration as any, null);

    expect(output).toEqual([matomoConfig, gaConfig]);
  });

  it('works correctly with regular user', () => {
    const output = getActiveDestinations(
      mockAppConfiguration as any,
      {
        attributes: {
          roles: [],
          highest_role: 'user',
        },
      } as any
    );

    expect(output).toEqual([matomoConfig, gaConfig]);
  });

  it('works correctly with admin user', () => {
    const output = getActiveDestinations(
      mockAppConfiguration as any,
      {
        attributes: {
          roles: [{ type: 'admin' }],
        },
      } as any
    );

    expect(output).toEqual([matomoConfig, gaConfig, intercomConfig]);
  });
});
