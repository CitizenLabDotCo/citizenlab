import { renderHook } from 'utils/testUtils/rtl';

import useOnQuerySuccess from './useOnQuerySuccess';

const pending = {
  isSuccess: false,
  isPlaceholderData: false,
  dataUpdatedAt: 0,
};

const success = {
  isSuccess: true,
  isPlaceholderData: false,
  dataUpdatedAt: 1000,
};

describe('useOnQuerySuccess', () => {
  it('does not call the callback while the query has no data', () => {
    const callback = jest.fn();
    renderHook(() => useOnQuerySuccess(pending, callback));

    expect(callback).not.toHaveBeenCalled();
  });

  it('calls the callback once the query succeeds', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      (state) => useOnQuerySuccess(state, callback),
      { initialProps: pending }
    );

    rerender(success);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('calls the callback for data that came straight from the cache', () => {
    const callback = jest.fn();
    renderHook(() => useOnQuerySuccess(success, callback));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call the callback for placeholder data', () => {
    const callback = jest.fn();
    renderHook(() =>
      useOnQuerySuccess({ ...success, isPlaceholderData: true }, callback)
    );

    expect(callback).not.toHaveBeenCalled();
  });

  it('calls the callback again on a refetch', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      (state) => useOnQuerySuccess(state, callback),
      { initialProps: success }
    );

    rerender({ ...success, dataUpdatedAt: 2000 });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('does not call the callback again when nothing was refetched', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      (state) => useOnQuerySuccess(state, callback),
      { initialProps: success }
    );

    rerender(success);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('uses the latest callback, without refiring when only its identity changed', () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(
      ({ state, callback }) => useOnQuerySuccess(state, callback),
      { initialProps: { state: success, callback: first } }
    );

    rerender({ state: success, callback: second });
    expect(second).not.toHaveBeenCalled();

    rerender({ state: { ...success, dataUpdatedAt: 2000 }, callback: second });
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('does not throw when no callback is passed', () => {
    expect(() => renderHook(() => useOnQuerySuccess(success))).not.toThrow();
  });
});
