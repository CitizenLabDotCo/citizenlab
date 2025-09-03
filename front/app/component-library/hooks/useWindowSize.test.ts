import { replaceRaf } from 'raf-stub';

import { renderHook, waitFor, act } from '../utils/testUtils/rtl';

import useWindowSize from './useWindowSize';

declare let requestAnimationFrame: {
  reset: () => void;
  step: (steps?: number, duration?: number) => void;
};

function triggerResize(dimension: 'width' | 'height', value: number) {
  if (dimension === 'width') {
    (window.innerWidth as number) = value;
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (dimension === 'height') {
    (window.innerHeight as number) = value;
  }

  window.dispatchEvent(new Event('resize'));
}

describe('useWindowSize', () => {
  beforeAll(() => {
    replaceRaf();
  });

  afterEach(() => {
    requestAnimationFrame.reset();
  });

  it('should return current window dimensions', () => {
    const hook = renderHook(useWindowSize);

    expect(hook.result.current.windowHeight).toBe(window.innerHeight);
    expect(hook.result.current.windowWidth).toBe(window.innerWidth);
  });

  it('should re-render on height change', async () => {
    const hook = renderHook(useWindowSize);

    act(() => {
      triggerResize('height', 360);
      requestAnimationFrame.step();
    });

    await waitFor(() => expect(hook.result.current.windowHeight).toBe(360));

    act(() => {
      triggerResize('height', 2048);
      requestAnimationFrame.step();
    });

    await waitFor(() => expect(hook.result.current.windowHeight).toBe(2048));
  });

  it('should re-render on width change', async () => {
    const hook = renderHook(useWindowSize);

    act(() => {
      triggerResize('width', 360);
      requestAnimationFrame.step();
    });

    await waitFor(() => expect(hook.result.current.windowWidth).toBe(360));

    act(() => {
      triggerResize('width', 2048);
      requestAnimationFrame.step();
    });

    await waitFor(() => expect(hook.result.current.windowWidth).toBe(2048));
  });
});
