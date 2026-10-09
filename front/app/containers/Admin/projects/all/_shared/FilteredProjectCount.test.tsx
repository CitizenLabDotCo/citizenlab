import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import FilteredProjectCount from './FilteredProjectCount';

let mockSearch: Record<string, unknown> = {};
jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useSearch: () => mockSearch,
}));
jest.mock('hooks/useFeatureFlag', () => () => true);

const page = (count: number) => ({
  pages: [
    {
      data: count > 0 ? [{ id: 'project-1' }] : [],
      links: {
        last: `http://localhost/web_api/v1/projects/for_admin?page[number]=${Math.max(
          count,
          1
        )}&page[size]=1`,
      },
    },
  ],
});

const TOTAL_COUNT = 48;
let mockFilteredCount = 3;
const mockUseInfiniteProjectsMiniAdmin = jest.fn(
  (params: Record<string, unknown>, _pageSize: number) => ({
    data: page(
      Object.keys(params).length > 1 ? mockFilteredCount : TOTAL_COUNT
    ),
  })
);
jest.mock(
  'api/projects_mini_admin/useInfiniteProjectsMiniAdmin',
  () =>
    (...args: [Record<string, unknown>, number]) =>
      mockUseInfiniteProjectsMiniAdmin(...args)
);

describe('FilteredProjectCount', () => {
  beforeEach(() => {
    mockSearch = {};
    mockFilteredCount = 3;
    mockUseInfiniteProjectsMiniAdmin.mockClear();
  });

  it('shows nothing, and fetches nothing, without filters', () => {
    render(<FilteredProjectCount />);

    expect(screen.queryByText(/of/)).not.toBeInTheDocument();
    expect(mockUseInfiniteProjectsMiniAdmin).not.toHaveBeenCalled();
  });

  it('shows nothing for only a non-default sort', () => {
    mockSearch = { sort: 'alphabetically_asc' };
    render(<FilteredProjectCount />);

    expect(mockUseInfiniteProjectsMiniAdmin).not.toHaveBeenCalled();
  });

  it('shows the filtered and the total number of projects', () => {
    mockSearch = { status: ['published'], sort: 'alphabetically_asc' };
    render(<FilteredProjectCount />);

    expect(screen.getByText('3 of 48 projects')).toBeInTheDocument();
  });

  it('shows 0 when no project matches the filters', () => {
    mockFilteredCount = 0;
    mockSearch = { search: 'nothing matches' };
    render(<FilteredProjectCount />);

    expect(screen.getByText('0 of 48 projects')).toBeInTheDocument();
  });

  it('counts with one project per page, sorted by creation date', () => {
    mockSearch = { status: ['published'], sort: 'alphabetically_asc' };
    render(<FilteredProjectCount />);

    expect(mockUseInfiniteProjectsMiniAdmin).toHaveBeenCalledWith(
      { status: ['published'], sort: 'recently_created_desc' },
      1
    );
    expect(mockUseInfiniteProjectsMiniAdmin).toHaveBeenCalledWith(
      { sort: 'recently_created_desc' },
      1
    );
  });
});
