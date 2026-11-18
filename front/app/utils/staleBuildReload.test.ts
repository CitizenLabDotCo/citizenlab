import { navigateToUrl, reloadPage } from 'utils/urlUtils';

import type { AnyRouter } from '@tanstack/react-router';

jest.mock('utils/urlUtils', () => ({
  navigateToUrl: jest.fn(),
  reloadPage: jest.fn(),
}));
const reload = jest.mocked(reloadPage);
const assign = jest.mocked(navigateToUrl);

type Listener = (event: { toLocation: { href: string } }) => void;

const chunkError = new TypeError(
  'Failed to fetch dynamically imported module: /assets/ProjectsShow.js'
);

// Fresh module per test, since its state is module-level.
const setup = () => {
  let module: typeof import('./staleBuildReload') | undefined;
  jest.isolateModules(() => {
    module =
      jest.requireActual<typeof import('./staleBuildReload')>(
        './staleBuildReload'
      );
  });
  if (!module) throw new Error('staleBuildReload did not load');

  let navigate: Listener = () => {};
  const router = {
    subscribe: (_event: string, listener: Listener) => {
      navigate = listener;
    },
  } as unknown as AnyRouter; // Only `subscribe` is used.

  const addListener = jest.spyOn(window, 'addEventListener');
  module.installStaleBuildReload(router);
  const preloadError = addListener.mock.calls[0][1];
  addListener.mockRestore();

  return {
    isReloadingForNewBuild: module.isReloadingForNewBuild,
    navigate: (href: string) => navigate({ toLocation: { href } }),
    failChunk: () => {
      const event = new Event('vite:preloadError', { cancelable: true });
      Object.assign(event, { payload: chunkError });
      window.dispatchEvent(event);
      return event;
    },
    cleanup: () =>
      window.removeEventListener('vite:preloadError', preloadError),
  };
};

let cleanup: () => void = () => {};

beforeEach(() => {
  reload.mockClear();
  assign.mockClear();
  sessionStorage.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  cleanup();
  jest.useRealTimers();
});

describe('installStaleBuildReload', () => {
  it('reloads when a chunk fails right after a route change', () => {
    const app = setup();
    cleanup = app.cleanup;

    app.navigate('/en/projects/a');
    const event = app.failChunk();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(app.isReloadingForNewBuild()).toBe(true);
    // The import error still throws, so lazy() doesn't get an empty module.
    expect(event.defaultPrevented).toBe(false);
  });

  it('reloads only once per failing chunk', () => {
    const app = setup();
    cleanup = app.cleanup;

    app.navigate('/en/projects/a');
    app.failChunk();
    app.failChunk();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload when a chunk fails mid-page', () => {
    const app = setup();
    cleanup = app.cleanup;

    app.navigate('/en/projects/a');
    jest.advanceTimersByTime(60_000);
    app.failChunk();

    expect(reload).not.toHaveBeenCalled();
    expect(app.isReloadingForNewBuild()).toBe(false);
  });

  it('does a full page load on the next route change after a chunk failed', () => {
    const app = setup();
    cleanup = app.cleanup;

    app.failChunk();
    app.navigate('/en/projects/b');

    expect(reload).not.toHaveBeenCalled();
    expect(assign).toHaveBeenCalledWith('/en/projects/b');
    expect(app.isReloadingForNewBuild()).toBe(true);
  });

  it('navigates normally while the build is current', () => {
    const app = setup();
    cleanup = app.cleanup;

    app.navigate('/en/projects/b');

    expect(assign).not.toHaveBeenCalled();
  });
});
