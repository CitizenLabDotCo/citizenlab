import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import BlockedUsers from './BlockedUsers';

let mockedIsUserBlockingEnabled = true;

jest.mock('hooks/useFeatureFlag', () => {
  return () => mockedIsUserBlockingEnabled;
});

describe('BlockedUsers', () => {
  it('shows blocked users when the user_blocking feature flag is enabled', () => {
    render(<BlockedUsers />);

    expect(screen.queryByText('Blocked users')).toBeInTheDocument();
  });

  it('shows nothing when the user_blocking feature flag is disabled', () => {
    mockedIsUserBlockingEnabled = false;
    render(<BlockedUsers />);

    expect(screen.queryByText('Blocked users')).not.toBeInTheDocument();
  });
});
