import React from 'react';

import { act, fireEvent, render, screen } from 'utils/testUtils/rtl';

import SearchToggle from './SearchToggle';

let mockSearch: { search?: string } = {};
const mockUpdateSearchParams = jest.fn((params: { search?: string }) => {
  mockSearch = { ...mockSearch, ...params };
});

jest.mock('utils/router', () => ({
  useSearch: () => mockSearch,
}));

jest.mock('utils/cl-router/updateSearchParams', () => ({
  updateSearchParams: (params: { search?: string }) =>
    mockUpdateSearchParams(params),
}));

const advance = (ms: number) =>
  act(() => {
    jest.advanceTimersByTime(ms);
  });

const field = () => screen.getByRole('searchbox');

const openAndType = (text: string) => {
  fireEvent.click(screen.getByRole('button', { name: 'Search' }));
  fireEvent.change(field(), { target: { value: text } });
};

describe('SearchToggle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockSearch = {};
    mockUpdateSearchParams.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('writes the search once typing pauses', () => {
    render(<SearchToggle />);
    openAndType('park');

    advance(400);
    expect(mockUpdateSearchParams).not.toHaveBeenCalled();

    advance(200);
    expect(mockUpdateSearchParams).toHaveBeenLastCalledWith({
      search: 'park',
    });
  });

  it('drops a search still being typed when Escape closes the field', () => {
    render(<SearchToggle />);
    openAndType('park');
    fireEvent.keyDown(field(), { key: 'Escape' });

    advance(1000);
    expect(mockUpdateSearchParams).not.toHaveBeenCalledWith({
      search: 'park',
    });
    expect(mockUpdateSearchParams).toHaveBeenLastCalledWith({
      search: undefined,
    });
    expect(screen.getByRole('button', { name: 'Search' })).toHaveFocus();
  });

  it('closes the field when the search is cleared elsewhere', () => {
    mockSearch = { search: 'park' };
    const { rerender } = render(<SearchToggle />);
    expect(field()).toHaveValue('park');

    mockSearch = {};
    rerender(<SearchToggle />);

    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('shows a search set elsewhere', () => {
    mockSearch = { search: 'park' };
    const { rerender } = render(<SearchToggle />);

    mockSearch = { search: 'school' };
    rerender(<SearchToggle />);

    expect(field()).toHaveValue('school');
  });

  it('keeps the same field while its own search reaches the URL', () => {
    const { rerender } = render(<SearchToggle />);
    openAndType('park');
    const typedInto = field();

    advance(600);
    rerender(<SearchToggle />);

    expect(field()).toBe(typedInto);
    expect(field()).toHaveValue('park');
  });
});
