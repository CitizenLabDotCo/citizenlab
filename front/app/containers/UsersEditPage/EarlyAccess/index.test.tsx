import React from 'react';

import { IUser } from 'api/users/types';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import { EARLY_ACCESS_FEATURES } from './features';

import EarlyAccess from '.';

const mockUpdateUser = jest.fn();

jest.mock('api/users/useUpdateUser', () => () => ({ mutate: mockUpdateUser }));

let mockAuthUser: IUser | undefined;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

const buildUser = (roles: { type: string }[], optedIn: string[]) =>
  ({
    data: {
      id: 'user-id',
      type: 'user',
      attributes: { roles, early_access_features: optedIn },
    },
  } as unknown as IUser);

const firstFeature = EARLY_ACCESS_FEATURES[0];

describe('<EarlyAccess />', () => {
  beforeEach(() => mockUpdateUser.mockClear());

  it('renders nothing for a resident', () => {
    mockAuthUser = buildUser([], []);
    render(<EarlyAccess />);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders nothing when nobody is signed in', () => {
    mockAuthUser = undefined;
    render(<EarlyAccess />);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('shows a toggle per early access feature for an admin', () => {
    mockAuthUser = buildUser([{ type: 'admin' }], []);
    render(<EarlyAccess />);

    expect(screen.getAllByRole('checkbox')).toHaveLength(
      EARLY_ACCESS_FEATURES.length
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('reflects what the admin already opted into', () => {
    mockAuthUser = buildUser([{ type: 'admin' }], [firstFeature.name]);
    render(<EarlyAccess />);

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('opts in when the toggle is switched on', async () => {
    mockAuthUser = buildUser([{ type: 'admin' }], []);
    render(<EarlyAccess />);

    await userEvent.click(screen.getByRole('checkbox'));

    await waitFor(() =>
      expect(mockUpdateUser).toHaveBeenCalledWith(
        { userId: 'user-id', early_access_features: [firstFeature.name] },
        expect.anything()
      )
    );
  });

  it('opts out when the toggle is switched off', async () => {
    mockAuthUser = buildUser([{ type: 'admin' }], [firstFeature.name]);
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
