import React from 'react';

import { IUser, OfferedEarlyAccessFeatures } from 'api/users/types';

import { render, screen, userEvent, waitFor } from 'utils/testUtils/rtl';

import EarlyAccess from '.';

const mockUpdateUser = jest.fn();
let mockIsPending = false;

jest.mock('api/users/useUpdateUser', () => () => ({
  mutate: mockUpdateUser,
  isPending: mockIsPending,
}));

let mockAuthUser: IUser | undefined;
let mockIsFetching = false;
jest.mock('api/me/useAuthUser', () => () => ({
  data: mockAuthUser,
  isFetching: mockIsFetching,
}));

jest.mock('./features', () => ({
  EARLY_ACCESS_FEATURES: [
    {
      name: 'spaces',
      title: { id: 'general.title', defaultMessage: 'General feature' },
      description: { id: 'general.description', defaultMessage: 'Anyone.' },
    },
    {
      name: 'project_planning_calendar',
      title: { id: 'internal.title', defaultMessage: 'Internal feature' },
      description: { id: 'internal.description', defaultMessage: 'Staff.' },
    },
  ],
}));

const GENERAL_ONLY: OfferedEarlyAccessFeatures = { spaces: 'general' };

const BOTH_LEVELS: OfferedEarlyAccessFeatures = {
  spaces: 'general',
  project_planning_calendar: 'internal',
};

const buildUser = ({
  offered,
  optedIn = [] as string[],
}: {
  offered?: OfferedEarlyAccessFeatures;
  optedIn?: string[];
}) =>
  ({
    data: {
      id: 'user-id',
      type: 'user',
      attributes: {
        early_access_features: optedIn,
        offered_early_access_features: offered,
      },
    },
  } as unknown as IUser);

describe('<EarlyAccess />', () => {
  beforeEach(() => {
    mockUpdateUser.mockReset();
    mockIsPending = false;
    mockIsFetching = false;
  });

  it('renders nothing when the API offers no early access', () => {
    mockAuthUser = buildUser({});
    render(<EarlyAccess />);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders nothing when nobody is signed in', () => {
    mockAuthUser = undefined;
    render(<EarlyAccess />);

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('offers only the features the API reports', () => {
    mockAuthUser = buildUser({ offered: GENERAL_ONLY });
    render(<EarlyAccess />);

    expect(screen.getByText('General feature')).toBeInTheDocument();
    expect(screen.queryByText('Internal feature')).not.toBeInTheDocument();
  });

  it('offers both levels when the API reports both', () => {
    mockAuthUser = buildUser({ offered: BOTH_LEVELS });
    render(<EarlyAccess />);

    expect(screen.getByText('General feature')).toBeInTheDocument();
    expect(screen.getByText('Internal feature')).toBeInTheDocument();
  });

  it('labels the internal level apart from the general one', () => {
    mockAuthUser = buildUser({ offered: BOTH_LEVELS });
    render(<EarlyAccess />);

    expect(screen.getByText('Internal Early Access')).toBeInTheDocument();
    expect(screen.getByText('Early Access')).toBeInTheDocument();
  });

  it('reflects what the admin already opted into', () => {
    mockAuthUser = buildUser({
      offered: GENERAL_ONLY,
      optedIn: ['spaces'],
    });
    render(<EarlyAccess />);

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('opts in when the toggle is switched on', async () => {
    mockAuthUser = buildUser({ offered: GENERAL_ONLY });
    render(<EarlyAccess />);

    await userEvent.click(screen.getByRole('checkbox'));

    await waitFor(() =>
      expect(mockUpdateUser).toHaveBeenCalledWith(
        { userId: 'user-id', early_access_features: ['spaces'] },
        expect.anything()
      )
    );
  });

  it('opts out when the toggle is switched off', async () => {
    mockAuthUser = buildUser({
      offered: GENERAL_ONLY,
      optedIn: ['spaces'],
    });
    render(<EarlyAccess />);

    await userEvent.click(screen.getByRole('checkbox'));

    await waitFor(() =>
      expect(mockUpdateUser).toHaveBeenCalledWith(
        { userId: 'user-id', early_access_features: [] },
        expect.anything()
      )
    );
  });

  it('tells the admin when the change was not saved', async () => {
    mockUpdateUser.mockImplementation((_variables, { onError }) => onError());
    mockAuthUser = buildUser({ offered: GENERAL_ONLY });
    render(<EarlyAccess />);

    await userEvent.click(screen.getByRole('checkbox'));

    expect(
      await screen.findByText(/We could not save that change/)
    ).toBeInTheDocument();
  });

  it('blocks a second change until the saved list is back', () => {
    mockIsPending = true;
    mockAuthUser = buildUser({ offered: BOTH_LEVELS });
    render(<EarlyAccess />);

    screen
      .getAllByRole('checkbox')
      .forEach((toggle) => expect(toggle).toBeDisabled());
  });
});
