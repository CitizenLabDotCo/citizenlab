import React from 'react';

import { IUser } from 'api/users/types';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import EarlyAccess from '.';

const mockUpdateUser = jest.fn();

jest.mock('api/users/useUpdateUser', () => () => ({ mutate: mockUpdateUser }));

let mockAuthUser: IUser | undefined;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

// The real registry is empty between features, so the section is exercised
// against a stand-in that covers both tiers.
jest.mock('./features', () => ({
  EARLY_ACCESS_FEATURES: [
    {
      name: 'general_feature',
      level: 'general',
      title: { id: 'general.title', defaultMessage: 'General feature' },
      description: { id: 'general.description', defaultMessage: 'Anyone.' },
    },
    {
      name: 'internal_feature',
      level: 'internal',
      title: { id: 'internal.title', defaultMessage: 'Internal feature' },
      description: { id: 'internal.description', defaultMessage: 'Staff.' },
    },
  ],
}));

const buildUser = ({
  admin = false,
  superAdmin = false,
  optedIn = [] as string[],
}) =>
  ({
    data: {
      id: 'user-id',
      type: 'user',
      attributes: {
        roles: admin || superAdmin ? [{ type: 'admin' }] : [],
        highest_role: superAdmin ? 'super_admin' : admin ? 'admin' : 'user',
        early_access_features: optedIn,
      },
    },
  } as unknown as IUser);

describe('<EarlyAccess />', () => {
  beforeEach(() => mockUpdateUser.mockClear());

  it('renders nothing for a resident', () => {
    mockAuthUser = buildUser({});
    render(<EarlyAccess />);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders nothing when nobody is signed in', () => {
    mockAuthUser = undefined;
    render(<EarlyAccess />);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('offers only the general tier to an admin', () => {
    mockAuthUser = buildUser({ admin: true });
    render(<EarlyAccess />);

    expect(screen.getByText('General feature')).toBeInTheDocument();
    expect(screen.queryByText('Internal feature')).not.toBeInTheDocument();
  });

  it('offers both tiers to a Go Vocal admin', () => {
    mockAuthUser = buildUser({ superAdmin: true });
    render(<EarlyAccess />);

    expect(screen.getByText('General feature')).toBeInTheDocument();
    expect(screen.getByText('Internal feature')).toBeInTheDocument();
  });

  it('labels the internal tier apart from the general one', () => {
    mockAuthUser = buildUser({ superAdmin: true });
    render(<EarlyAccess />);

    expect(screen.getByText('Internal Early Access')).toBeInTheDocument();
    expect(screen.getByText('Early Access')).toBeInTheDocument();
  });

  it('reflects what the admin already opted into', () => {
    mockAuthUser = buildUser({ admin: true, optedIn: ['general_feature'] });
    render(<EarlyAccess />);

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('opts in when the toggle is switched on', async () => {
    mockAuthUser = buildUser({ admin: true });
    render(<EarlyAccess />);

    await userEvent.click(screen.getByRole('checkbox'));

    await waitFor(() =>
      expect(mockUpdateUser).toHaveBeenCalledWith(
        { userId: 'user-id', early_access_features: ['general_feature'] },
        expect.anything()
      )
    );
  });

  it('opts out when the toggle is switched off', async () => {
    mockAuthUser = buildUser({ admin: true, optedIn: ['general_feature'] });
    render(<EarlyAccess />);

    await userEvent.click(screen.getByRole('checkbox'));

    await waitFor(() =>
      expect(mockUpdateUser).toHaveBeenCalledWith(
        { userId: 'user-id', early_access_features: [] },
        expect.anything()
      )
    );
  });
});
