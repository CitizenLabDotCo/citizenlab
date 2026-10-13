import { isAdmin, isRegularUser } from 'utils/permissions/roles';

import { registerDestination, IDestinationConfig } from './destinations';
import { getActiveDestinations } from './utils';

const mockAppConfiguration = {
  id: '1',
  attributes: {
    settings: {
      matomo: {
        allowed: true,
        enabled: true,
      },
      google_tag_manager: {
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

const gtmConfig: IDestinationConfig = {
  key: 'google_tag_manager',
  category: 'analytics',
  feature_flag: 'google_tag_manager',
  name: () => 'Google Tag Manager',
};
registerDestination(gtmConfig);

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

    expect(output).toEqual([matomoConfig, gtmConfig]);
  });

  it('works correctly with regular user', () => {
    const output = getActiveDestinations(mockAppConfiguration, {
      attributes: {
        roles: [],
        highest_role: 'user',
      },
    } as any);

    expect(output).toEqual([matomoConfig, gtmConfig]);
  });

  it('works correctly with admin user', () => {
    const output = getActiveDestinations(mockAppConfiguration, {
      attributes: {
        roles: [{ type: 'admin' }],
      },
    } as any);

    expect(output).toEqual([matomoConfig, gtmConfig, intercomConfig]);
  });
});
