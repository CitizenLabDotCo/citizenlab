import { act, renderHook } from 'utils/testUtils/rtl';

import useAddedColumns from './useAddedColumns';

let mockSearch: { cols?: string[] } = {};
const mockUpdateSearchParams = jest.fn();

jest.mock('utils/router', () => ({
  useSearch: () => mockSearch,
}));

jest.mock('utils/cl-router/updateSearchParams', () => ({
  updateSearchParams: (params: unknown) => mockUpdateSearchParams(params),
}));

const STORAGE_KEY = 'admin_projects_list_columns';

describe('useAddedColumns', () => {
  beforeEach(() => {
    mockSearch = {};
    mockUpdateSearchParams.mockClear();
    localStorage.clear();
  });

  it('adds no columns by default', () => {
    expect(renderHook(() => useAddedColumns()).result.current.added).toEqual(
      []
    );
  });

  it('keeps the columns this browser last added, dropping unknown ones', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['end_date', 'colour']));

    expect(renderHook(() => useAddedColumns()).result.current.added).toEqual([
      'end_date',
    ]);
  });

  it('adds none when the stored value is broken', () => {
    localStorage.setItem(STORAGE_KEY, '{not json');

    expect(renderHook(() => useAddedColumns()).result.current.added).toEqual(
      []
    );
  });

  it("prefers the link's columns, even none", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['end_date']));
    mockSearch = { cols: [] };

    expect(renderHook(() => useAddedColumns()).result.current.added).toEqual(
      []
    );
  });

  it('adds a column in the table order, and takes it away again', () => {
    mockSearch = { cols: ['end_date'] };
    const { result } = renderHook(() => useAddedColumns());

    act(() => result.current.toggleColumn('access'));
    expect(mockUpdateSearchParams).toHaveBeenLastCalledWith({
      cols: ['access', 'end_date'],
    });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('["access","end_date"]');

    act(() => result.current.toggleColumn('end_date'));
    expect(mockUpdateSearchParams).toHaveBeenLastCalledWith({ cols: [] });
  });
});
