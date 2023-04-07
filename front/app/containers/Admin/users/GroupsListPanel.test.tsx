import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import GroupsListPanel from './GroupsListPanel';

let mockedIsUserBlockingEnabled = true;

jest.mock('hooks/useFeatureFlag', () => {
  return () => mockedIsUserBlockingEnabled;
});

describe('GroupsListPanel', () => {
  it('shows the blocked users link when the user_blocking feature flag is enabled', () => {
    render(<GroupsListPanel onCreateGroup={() => {}} />);

    expect(screen.getByTestId('blocked-users-link')).toBeInTheDocument();
  });

  it('does not show the blocked users link when the user_blocking feature flag is disabled', () => {
    mockedIsUserBlockingEnabled = false;
    render(<GroupsListPanel onCreateGroup={() => {}} />);

    expect(screen.queryByTestId('blocked-users-link')).not.toBeInTheDocument();
  });
});
