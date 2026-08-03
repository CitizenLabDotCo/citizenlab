import { act, renderHook } from 'utils/testUtils/rtl';

import useTimeoutWhen from './useTimeoutWhen';

describe('useTimeoutWhen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fires once active has been true for the full delay', () => {
    const onTimeout = jest.fn();
    renderHook(() => useTimeoutWhen(true, 1000, onTimeout));

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(onTimeout).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('does not fire while inactive', () => {
    const onTimeout = jest.fn();
    renderHook(() => useTimeoutWhen(false, 1000, onTimeout));

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('cancels the timer when active flips back to false', () => {
    const onTimeout = jest.fn();
    const { rerender } = renderHook(
      ({ active }) => useTimeoutWhen(active, 1000, onTimeout),
      { initialProps: { active: true } }
    );

    act(() => {
      jest.advanceTimersByTime(500);
    });
    rerender({ active: false });

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it('restarts the timer when active flips back to true', () => {
    const onTimeout = jest.fn();
    const { rerender } = renderHook(
      ({ active }) => useTimeoutWhen(active, 1000, onTimeout),
      { initialProps: { active: true } }
    );

    act(() => {
      jest.advanceTimersByTime(900);
    });
    rerender({ active: false });
    rerender({ active: true });

    act(() => {
      jest.advanceTimersByTime(900);
    });
    expect(onTimeout).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('does not restart the timer when only the callback changes', () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(
      ({ onTimeout }) => useTimeoutWhen(true, 1000, onTimeout),
      { initialProps: { onTimeout: first } }
    );

    act(() => {
      jest.advanceTimersByTime(900);
    });
    rerender({ onTimeout: second });

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('restarts the timer when restartKey changes while staying active', () => {
    const onTimeout = jest.fn();
    const { rerender } = renderHook(
      ({ restartKey }) => useTimeoutWhen(true, 1000, onTimeout, restartKey),
      { initialProps: { restartKey: 'step-1' } }
    );

    act(() => {
      jest.advanceTimersByTime(900);
    });
    rerender({ restartKey: 'step-2' });

    act(() => {
      jest.advanceTimersByTime(900);
    });
    expect(onTimeout).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('keeps counting when restartKey is unchanged', () => {
    const onTimeout = jest.fn();
    const { rerender } = renderHook(
      ({ restartKey }) => useTimeoutWhen(true, 1000, onTimeout, restartKey),
      { initialProps: { restartKey: 'step-1' } }
    );

    act(() => {
      jest.advanceTimersByTime(900);
    });
    rerender({ restartKey: 'step-1' });

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(onTimeout).toHaveBeenCalledTimes(1);
  });

  it('does not fire after unmount', () => {
    const onTimeout = jest.fn();
    const { unmount } = renderHook(() => useTimeoutWhen(true, 1000, onTimeout));

    unmount();
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(onTimeout).not.toHaveBeenCalled();
  });
});
