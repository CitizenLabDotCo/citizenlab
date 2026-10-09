import { act, renderHook } from 'utils/testUtils/rtl';

import usePersistedParams from './usePersistedParams';

const STORAGE_KEY = 'admin_projects_overview_params:user-1';

let mockSearch: Record<string, unknown> = {};
jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useSearch: () => mockSearch,
}));

const mockUpdateSearchParams = jest.fn();
jest.mock('utils/cl-router/updateSearchParams', () => ({
  updateSearchParams: (params: Record<string, unknown>) =>
    mockUpdateSearchParams(params),
}));

let mockAuthUser: { data: { id: string } } | null | undefined = {
  data: { id: 'user-1' },
};
jest.mock('api/me/useAuthUser', () => () => ({ data: mockAuthUser }));

const getStored = () => {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

describe('usePersistedParams', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockSearch = {};
    mockAuthUser = { data: { id: 'user-1' } };
    mockUpdateSearchParams.mockReset();
  });

  it('restores the stored params when the URL has none', () => {
    const stored = {
      tab: 'calendar',
      status: ['published'],
      sort: 'alphabetically_asc',
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result, rerender } = renderHook(() => usePersistedParams());

    expect(mockUpdateSearchParams).toHaveBeenCalledWith(stored);
    expect(result.current.isRestoring).toBe(true);

    mockSearch = { ...stored };
    rerender();

    expect(result.current.isRestoring).toBe(false);
    expect(getStored()).toEqual(stored);
  });

  it('does not restore when the URL already has params, and stores those instead', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: ['published'] })
    );
    mockSearch = { tab: 'folders', managers: ['user-2'] };

    const { result } = renderHook(() => usePersistedParams());

    expect(mockUpdateSearchParams).not.toHaveBeenCalled();
    expect(result.current.isRestoring).toBe(false);
    expect(getStored()).toEqual({ tab: 'folders', managers: ['user-2'] });
  });

  it('mirrors param changes to storage and clears it when all params are removed', () => {
    const { result, rerender } = renderHook(() => usePersistedParams());

    expect(result.current.isRestoring).toBe(false);
    expect(getStored()).toBeNull();

    mockSearch = { status: ['draft'], search: 'park' };
    rerender();
    expect(getStored()).toEqual({ status: ['draft'], search: 'park' });

    mockSearch = {};
    rerender();
    expect(getStored()).toBeNull();
  });

  it('only stores the overview params', () => {
    mockSearch = { status: ['draft'], unrelated: 'x' };

    renderHook(() => usePersistedParams());

    expect(getStored()).toEqual({ status: ['draft'] });
  });

  it('drops stored params that are no longer valid', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sort: 'no_longer_a_sort_option' })
    );

    const { result } = renderHook(() => usePersistedParams());

    expect(mockUpdateSearchParams).not.toHaveBeenCalled();
    expect(result.current.isRestoring).toBe(false);
    expect(getStored()).toBeNull();
  });

  it('keeps the params of different users apart', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: ['published'] })
    );
    mockAuthUser = { data: { id: 'user-2' } };

    const { result } = renderHook(() => usePersistedParams());

    expect(mockUpdateSearchParams).not.toHaveBeenCalled();
    expect(result.current.isRestoring).toBe(false);
  });

  it('waits for the user to load before deciding', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status: ['published'] })
    );
    mockAuthUser = undefined;

    const { result, rerender } = renderHook(() => usePersistedParams());

    expect(result.current.isRestoring).toBe(true);
    expect(mockUpdateSearchParams).not.toHaveBeenCalled();

    mockAuthUser = { data: { id: 'user-1' } };
    act(() => rerender());

    expect(mockUpdateSearchParams).toHaveBeenCalledWith({
      status: ['published'],
    });
  });

  it('does not restore for signed-out users', () => {
    mockAuthUser = null;

    const { result } = renderHook(() => usePersistedParams());

    expect(result.current.isRestoring).toBe(false);
    expect(mockUpdateSearchParams).not.toHaveBeenCalled();
  });
});
