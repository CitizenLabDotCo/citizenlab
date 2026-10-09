import React from 'react';

import { act, fireEvent, render, screen } from 'utils/testUtils/rtl';

import Search from './Search';

let mockSearch: Record<string, unknown> = {};
jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useSearch: () => mockSearch,
}));

jest.mock('utils/cl-router/updateSearchParams', () => ({
  updateSearchParams: jest.fn(),
}));
jest.mock('utils/cl-router/removeSearchParams', () => ({
  removeSearchParams: jest.fn(),
}));

const getInput = () => screen.getByRole('searchbox') as HTMLInputElement;

describe('Search', () => {
  beforeEach(() => {
    mockSearch = {};
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('empties the input when the search is removed from the URL', () => {
    mockSearch = { search: 'park' };
    const { rerender } = render(<Search placeholder="Search projects" />);
    expect(getInput()).toHaveValue('park');

    mockSearch = {};
    rerender(<Search placeholder="Search projects" />);

    expect(getInput()).toHaveValue('');
  });

  it('keeps the same input when the admin empties the search themselves', () => {
    jest.useFakeTimers();
    mockSearch = { search: 'park' };
    const { rerender } = render(<Search placeholder="Search projects" />);
    const input = getInput();

    fireEvent.change(input, { target: { value: '' } });
    act(() => {
      jest.runAllTimers();
    });
    mockSearch = {};
    rerender(<Search placeholder="Search projects" />);

    expect(getInput()).toBe(input);
  });
});
