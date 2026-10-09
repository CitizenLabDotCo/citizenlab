import React from 'react';

import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import DynamicFilters from './DynamicFilters';

jest.mock('hooks/useFeatureFlag', () => () => true);
jest.mock('api/me/useAuthUser');

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

// The individual filters are not under test here.
jest.mock('./ActiveFilter', () => () => null);
jest.mock('./AddFilterDropdown', () => () => null);

describe('DynamicFilters — clear button', () => {
  beforeEach(() => {
    mockSearch = {};
    mockRemoveSearchParams.mockReset();
  });

  it('does not show the clear button when nothing is set', () => {
    render(<DynamicFilters />);

    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it('does not show the clear button for the default sort', () => {
    mockSearch = { sort: 'recently_viewed' };
    render(<DynamicFilters />);

    expect(screen.queryByText('Clear')).not.toBeInTheDocument();
  });

  it.each([
    ['an added filter', { status: ['published'] }],
    ['pending approval', { review_state: 'pending' }],
    ['a minimum start date', { min_start_date: '2026-01-01' }],
    ['a maximum start date', { max_start_date: '2026-12-31' }],
    ['a non-default sort', { sort: 'alphabetically_asc' }],
    ['a search', { search: 'park' }],
  ])('shows the clear button for %s', (_, search) => {
    mockSearch = search;
    render(<DynamicFilters />);

    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('clears the added filters, the default filters, the sort and the search', () => {
    mockSearch = {
      status: ['published'],
      review_state: 'pending',
      sort: 'alphabetically_asc',
      search: 'park',
    };
    render(<DynamicFilters />);

    fireEvent.click(screen.getByText('Clear'));

    expect(mockRemoveSearchParams).toHaveBeenCalledWith([
      'status',
      'review_state',
      'min_start_date',
      'max_start_date',
      'sort',
      'search',
    ]);
  });
});
