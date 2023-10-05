import { getActiveDestinations } from './utils';
import { registerDestination, IDestinationConfig } from './destinations';
import { isAdmin, isRegularUser } from 'utils/permissions/roles';

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
} as any;

const matomoConfig: IDestinationConfig = {
  key: 'matomo',
  category: 'analytics',
  feature_flag: 'matomo',
  name: () => 'Matomo',
};
registerDestination(matomoConfig);

const gaConfig: IDestinationConfig = {
  key: 'google_analytics',
  category: 'analytics',
  feature_flag: 'google_analytics',
  name: () => 'Google Analytics',
};
registerDestination(gaConfig);

const intercomConfig: IDestinationConfig = {
  key: 'intercom',
  category: 'functional',
  feature_flag: 'intercom',
  hasPermission: (user) =>
    !!user && (isAdmin({ data: user }) || !isRegularUser({ data: user })),
  name: () => 'Intercom',
};
registerDestination(intercomConfig);

describe('getActiveDestinations', () => {
  it('works correctly without user', () => {
    const output = getActiveDestinations(mockAppConfiguration, null);

    expect(output).toEqual([matomoConfig, gaConfig]);
  });

  it('works correctly with regular user', () => {
    const output = getActiveDestinations(mockAppConfiguration, {
      attributes: {
        roles: [],
        highest_role: 'user',
      },
    } as any);

    expect(output).toEqual([matomoConfig, gaConfig]);
  });

  it('works correctly with admin user', () => {
    const output = getActiveDestinations(mockAppConfiguration, {
      attributes: {
        roles: [{ type: 'admin' }],
      },
    } as any);

    expect(output).toEqual([matomoConfig, gaConfig, intercomConfig]);
  });
});
