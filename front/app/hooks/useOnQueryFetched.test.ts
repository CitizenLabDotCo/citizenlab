import { renderHook } from 'utils/testUtils/rtl';

import useOnQueryFetched from './useOnQueryFetched';

const fetching = { isFetching: true, isSuccess: false };
const fetched = { isFetching: false, isSuccess: true };
const refetching = { isFetching: true, isSuccess: true };
const failed = { isFetching: false, isSuccess: false };

describe('useOnQueryFetched', () => {
  it('does not call the callback while the query is fetching', () => {
    const callback = jest.fn();
    renderHook(() => useOnQueryFetched(fetching, callback));

    expect(callback).not.toHaveBeenCalled();
  });

  it('calls the callback once the initial fetch succeeds', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      (state) => useOnQueryFetched(state, callback),
      { initialProps: fetching }
    );

    rerender(fetched);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call the callback for data that came straight from the cache', () => {
    const callback = jest.fn();
    renderHook(() => useOnQueryFetched(fetched, callback));

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not call the callback when the fetch fails', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      (state) => useOnQueryFetched(state, callback),
      { initialProps: fetching }
    );

    rerender(failed);

    expect(callback).not.toHaveBeenCalled();
  });

  it('calls the callback again after each refetch', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      (state) => useOnQueryFetched(state, callback),
      { initialProps: fetched }
    );

    rerender(refetching);
    expect(callback).not.toHaveBeenCalled();
    rerender(fetched);
    expect(callback).toHaveBeenCalledTimes(1);

    rerender(refetching);
    rerender(fetched);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('does not call the callback when the data changed without a fetch', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      (state) => useOnQueryFetched(state, callback),
      { initialProps: fetched }
    );

    // e.g. setQueryData from another response's `included` resources
    rerender({ ...fetched });

    expect(callback).not.toHaveBeenCalled();
  });

  it('uses the latest callback, without firing when only its identity changed', () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(
      ({ state, callback }) => useOnQueryFetched(state, callback),
      { initialProps: { state: fetched, callback: first } }
    );

    rerender({ state: fetched, callback: second });
    expect(second).not.toHaveBeenCalled();

    rerender({ state: refetching, callback: second });
    rerender({ state: fetched, callback: second });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('does not throw when no callback is passed', () => {
    const { rerender } = renderHook((state) => useOnQueryFetched(state), {
      initialProps: fetching,
    });

    expect(() => rerender(fetched)).not.toThrow();
  });
});
