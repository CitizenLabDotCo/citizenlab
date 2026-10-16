import { act, renderHook } from 'utils/testUtils/rtl';

import useViewMode from './useViewMode';

let mockSearch: { view_mode?: string } = {};
const mockUpdateSearchParams = jest.fn();

jest.mock('utils/router', () => ({
  useSearch: () => mockSearch,
}));

jest.mock('utils/cl-router/updateSearchParams', () => ({
  updateSearchParams: (params: unknown) => mockUpdateSearchParams(params),
}));

const STORAGE_KEY = 'admin_projects_view';

describe('useViewMode', () => {
  beforeEach(() => {
    mockSearch = {};
    mockUpdateSearchParams.mockClear();
    localStorage.clear();
  });

  it('starts in the grid', () => {
    expect(renderHook(() => useViewMode()).result.current.viewMode).toBe(
      'grid'
    );
  });

  it('opens in the view this browser last used', () => {
    localStorage.setItem(STORAGE_KEY, 'list');

    expect(renderHook(() => useViewMode()).result.current.viewMode).toBe(
      'list'
    );
  });

  it("prefers the link's view to this browser's", () => {
    localStorage.setItem(STORAGE_KEY, 'list');
    mockSearch = { view_mode: 'calendar' };

    expect(renderHook(() => useViewMode()).result.current.viewMode).toBe(
      'calendar'
    );
  });

  it('ignores a stored value that is no view', () => {
    localStorage.setItem(STORAGE_KEY, 'table');

    expect(renderHook(() => useViewMode()).result.current.viewMode).toBe(
      'grid'
    );
  });

  it('remembers a change and puts it in the URL', () => {
    const { result } = renderHook(() => useViewMode());

    act(() => result.current.setViewMode('list'));

    expect(localStorage.getItem(STORAGE_KEY)).toBe('list');
    expect(mockUpdateSearchParams).toHaveBeenCalledWith({ view_mode: 'list' });
  });

  it('still works when storage is blocked', () => {
    const getItem = jest
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('blocked');
      });

    expect(renderHook(() => useViewMode()).result.current.viewMode).toBe(
      'grid'
    );
    getItem.mockRestore();
  });
});
