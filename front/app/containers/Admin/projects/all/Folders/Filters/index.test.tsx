import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import Filters from '.';

let mockSpacesEnabled = true;
jest.mock('hooks/useFeatureFlag', () => () => mockSpacesEnabled);

// The filters read the admin projects search params; there is no router here.
jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useSearch: () => ({}),
}));

jest.mock('api/users/useUsers');
jest.mock('api/spaces/useSpaces', () => () => ({
  data: undefined,
  isLoading: false,
}));

describe('Folders Filters — spaces filter', () => {
  beforeEach(() => {
    mockSpacesEnabled = true;
  });

  it('shows the spaces filter when the spaces feature flag is enabled', () => {
    render(<Filters />);

    expect(screen.getByText('Spaces')).toBeInTheDocument();
  });

  it('does not show the spaces filter when the spaces feature flag is disabled', () => {
    mockSpacesEnabled = false;
    render(<Filters />);

    expect(screen.queryByText('Spaces')).not.toBeInTheDocument();
    // The other filters are unaffected.
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});
