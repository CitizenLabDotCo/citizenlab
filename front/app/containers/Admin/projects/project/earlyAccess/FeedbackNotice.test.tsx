import React from 'react';

import { IUser } from 'api/users/types';

import { render, screen } from 'utils/testUtils/rtl';

import FeedbackNotice from './FeedbackNotice';

let mockAuthUser: IUser | undefined;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

const buildUser = (optedIn: string[]) =>
  ({
    data: {
      id: 'user-id',
      type: 'user',
      attributes: {
        early_access_opt_ins: optedIn,
        offered_early_access_features: {
          project_backoffice_redesign: 'internal',
        },
      },
    },
  } as unknown as IUser);

describe('FeedbackNotice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders for a user who turned the redesign on through early access', () => {
    mockAuthUser = buildUser(['project_backoffice_redesign']);
    render(<FeedbackNotice />);

    expect(
      screen.getByText('You are using the new project back office.')
    ).toBeInTheDocument();
  });

  it('renders nothing when the redesign comes from the platform setting', () => {
    mockAuthUser = buildUser([]);
    render(<FeedbackNotice />);

    expect(
      screen.queryByText('You are using the new project back office.')
    ).not.toBeInTheDocument();
  });
});
