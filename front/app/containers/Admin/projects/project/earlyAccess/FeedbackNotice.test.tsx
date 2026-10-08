import React from 'react';

import { IUser, OfferedEarlyAccessFeatures } from 'api/users/types';

import { render, screen } from 'utils/testUtils/rtl';

import FeedbackNotice from './FeedbackNotice';

let mockAuthUser: IUser | undefined;
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

const OFFERED: OfferedEarlyAccessFeatures = {
  project_backoffice_redesign: 'internal',
};

const buildUser = (optedIn: string[], offered = OFFERED) =>
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
    expect(
      screen.getByRole('link', { name: '#dev-tandem-uxui-revamp' })
    ).toHaveAttribute(
      'href',
      'https://go-vocal.slack.com/archives/C0BRBG0TGM8'
    );
  });

  it('renders nothing when the redesign comes from the platform setting', () => {
    mockAuthUser = buildUser([]);
    render(<FeedbackNotice />);

    expect(
      screen.queryByText('You are using the new project back office.')
    ).not.toBeInTheDocument();
  });

  it('renders nothing for a stored opt-in once the redesign is no longer offered', () => {
    mockAuthUser = buildUser(['project_backoffice_redesign'], {});
    render(<FeedbackNotice />);

    expect(
      screen.queryByText('You are using the new project back office.')
    ).not.toBeInTheDocument();
  });
});
