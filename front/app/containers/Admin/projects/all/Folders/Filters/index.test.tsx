import React from 'react';

import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import Filters from '.';

let mockSpacesEnabled = true;
jest.mock('hooks/useFeatureFlag', () => () => mockSpacesEnabled);

// The filters read the admin projects search params; there is no router here.
let mockSearch: Record<string, unknown> = {};
jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useSearch: () => mockSearch,
}));

const mockRemoveSearchParams = jest.fn();
jest.mock('utils/cl-router/removeSearchParams', () => ({
  removeSearchParams: (params: string[]) => mockRemoveSearchParams(params),
}));

jest.mock('api/users/useUsers');
jest.mock('api/spaces/useSpaces', () => () => ({
  data: undefined,
  isLoading: false,
}));

describe('Folders Filters — spaces filter', () => {
  beforeEach(() => {
    mockSpacesEnabled = true;
    mockSearch = {};
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

describe('Folders Filters — clear button', () => {
  beforeEach(() => {
    mockSpacesEnabled = true;
    mockSearch = {};
    mockRemoveSearchParams.mockReset();
  });

  it('does not show the clear button when no filter is set', () => {
    render(<Filters />);

    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('shows the clear button when only the search is set', () => {
    mockSearch = { search: 'park' };
    render(<Filters />);

    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('clears the folder filters and the search', () => {
    mockSearch = { status: ['published'], search: 'park' };
    render(<Filters />);

    fireEvent.click(screen.getByText('Clear'));

    expect(mockRemoveSearchParams).toHaveBeenCalledWith([
      'managers',
      'status',
      'space_ids',
      'search',
    ]);
  });
});
