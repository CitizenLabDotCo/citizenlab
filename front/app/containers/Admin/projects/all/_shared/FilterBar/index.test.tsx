import React from 'react';

import { fireEvent, render, screen } from 'utils/testUtils/rtl';

import FilterBar from '.';

jest.mock('hooks/useFeatureFlag', () => () => true);
jest.mock('api/me/useAuthUser');

let mockSearch: Record<string, unknown> = {};
jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useSearch: () => mockSearch,
}));

const mockRemoveSearchParams = jest.fn();
jest.mock('utils/cl-router/removeSearchParams', () => ({
  removeSearchParams: (params: string[]) => mockRemoveSearchParams(params),
}));

jest.mock('./ActiveFilter', () => () => null);
jest.mock('./AddFilterDropdown', () => () => null);
jest.mock('./Filters/Sort', () => () => null);
jest.mock('./Filters/PendingApproval', () => () => null);
jest.mock('./Filters/Dates', () => () => null);
jest.mock('../FilteredProjectCount', () => () => (
  <span data-cy="filtered-project-count" />
));

describe('FilterBar — clear filters button', () => {
  beforeEach(() => {
    mockSearch = {};
    mockRemoveSearchParams.mockReset();
  });

  it('does not show the clear button when nothing is set', () => {
    render(<FilterBar />);

    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('does not show the clear button for the default sort', () => {
    mockSearch = { sort: 'recently_viewed' };
    render(<FilterBar />);

    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
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
    render(<FilterBar />);

    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('clears the added filters, the default filters, the sort and the search', () => {
    mockSearch = {
      status: ['published'],
      review_state: 'pending',
      sort: 'alphabetically_asc',
      search: 'park',
    };
    render(<FilterBar />);

    fireEvent.click(screen.getByText('Clear filters'));

    expect(mockRemoveSearchParams).toHaveBeenCalledWith([
      'status',
      'review_state',
      'min_start_date',
      'max_start_date',
      'sort',
      'search',
    ]);
  });

  it('shows the button on the same line as the project count', () => {
    mockSearch = { status: ['published'] };
    render(<FilterBar />);

    expect(
      document.querySelector('[data-cy="filtered-project-count"]')
        ?.parentElement
    ).toContainElement(screen.getByText('Clear filters').closest('button'));
  });
});
