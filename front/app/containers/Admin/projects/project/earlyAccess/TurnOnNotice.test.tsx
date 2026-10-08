import React from 'react';

import { IUser, OfferedEarlyAccessFeatures } from 'api/users/types';

import { render, screen, userEvent } from 'utils/testUtils/rtl';

import TurnOnNotice from './TurnOnNotice';

let mockAuthUser: IUser | undefined;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

const OFFERED: OfferedEarlyAccessFeatures = {
  project_backoffice_redesign: 'internal',
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
        early_access_opt_ins: optedIn,
        offered_early_access_features: offered,
      },
    },
  } as unknown as IUser);

describe('TurnOnNotice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders for a user offered the redesign who has not turned it on', () => {
    mockAuthUser = buildUser({ offered: OFFERED });
    render(<TurnOnNotice />);

    expect(
      screen.getByText('Try the new project back office.')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'profile settings' })
    ).toBeInTheDocument();
  });

  it('renders nothing when the redesign is not offered', () => {
    mockAuthUser = buildUser({ offered: {} });
    render(<TurnOnNotice />);

    expect(
      screen.queryByText('Try the new project back office.')
    ).not.toBeInTheDocument();
  });

  it('renders nothing once the user has turned it on', () => {
    mockAuthUser = buildUser({
      offered: OFFERED,
      optedIn: ['project_backoffice_redesign'],
    });
    render(<TurnOnNotice />);

    expect(
      screen.queryByText('Try the new project back office.')
    ).not.toBeInTheDocument();
  });

  it('stays hidden after it is dismissed', async () => {
    mockAuthUser = buildUser({ offered: OFFERED });
    const { unmount } = render(<TurnOnNotice />);

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(
      screen.queryByText('Try the new project back office.')
    ).not.toBeInTheDocument();

    unmount();
    render(<TurnOnNotice />);
    expect(
      screen.queryByText('Try the new project back office.')
    ).not.toBeInTheDocument();
  });
});
