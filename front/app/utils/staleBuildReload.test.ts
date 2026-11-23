import { reloadPage } from 'utils/urlUtils';

import type { AnyRouter } from '@tanstack/react-router';

jest.mock('utils/urlUtils', () => ({
  reloadPage: jest.fn(),
}));
const reload = jest.mocked(reloadPage);

type Listener = (event: { pathChanged: boolean }) => void;

const chunkError = (chunk: string) =>
  new TypeError(
    `Failed to fetch dynamically imported module: /assets/${chunk}`
  );

let cleanup = () => {};

// Loads a fresh module, as a page load would. Its state is module-level, while
// sessionStorage carries over like it does across a reload.
const loadPage = () => {
  cleanup();

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
  cleanup = () => window.removeEventListener('vite:preloadError', preloadError);

  return {
    isReloadingForNewBuild: module.isReloadingForNewBuild,
    changePath: () => navigate({ pathChanged: true }),
    changeSearch: () => navigate({ pathChanged: false }),
    failChunk: (chunk = 'ProjectsShow.js') => {
      const event = new Event('vite:preloadError', { cancelable: true });
      Object.assign(event, { payload: chunkError(chunk) });
      window.dispatchEvent(event);
      return event;
    },
  };
};

beforeEach(() => {
  reload.mockClear();
  sessionStorage.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  cleanup();
  cleanup = () => {};
  jest.useRealTimers();
});

describe('installStaleBuildReload', () => {
  it('reloads when a chunk fails right after a route change', () => {
    const app = loadPage();

    app.changePath();
    const event = app.failChunk();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(app.isReloadingForNewBuild()).toBe(true);
    // The import error still throws, so lazy() doesn't get an empty module.
    expect(event.defaultPrevented).toBe(false);
  });

  it('reloads only once per chunk per session', () => {
    const app = loadPage();
    app.changePath();
    app.failChunk();

    const reloaded = loadPage();
    reloaded.changePath();
    reloaded.failChunk();
    reloaded.changePath();
    jest.runAllTimers();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('does not reload when a chunk fails mid-page', () => {
    const app = loadPage();

    app.changePath();
    jest.advanceTimersByTime(60_000);
    app.failChunk();

    expect(reload).not.toHaveBeenCalled();
    expect(app.isReloadingForNewBuild()).toBe(false);
  });

  it('reloads once the router has pushed the next route after a chunk failed', () => {
    const app = loadPage();

    app.failChunk();
    app.changePath();

    expect(reload).not.toHaveBeenCalled();
    jest.advanceTimersByTime(0);
    expect(reload).toHaveBeenCalledTimes(1);
    expect(app.isReloadingForNewBuild()).toBe(true);
  });

  it('stops reloading on route changes once a failed chunk fails again after a reload', () => {
    const app = loadPage();
    app.failChunk();
    app.changePath();
    jest.runAllTimers();

    const reloaded = loadPage();
    jest.advanceTimersByTime(60_000);
    reloaded.failChunk();
    reloaded.changePath();
    jest.runAllTimers();

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('ignores chunk failures while a reload is under way', () => {
    const app = loadPage();

    app.failChunk('ProjectsShow.js');
    app.changePath();
    app.failChunk('IdeasShow.js');
    jest.runAllTimers();

    expect(reload).toHaveBeenCalledTimes(1);

    // IdeasShow.js still gets its own reload later in the session.
    const reloaded = loadPage();
    reloaded.changePath();
    reloaded.failChunk('IdeasShow.js');
    expect(reload).toHaveBeenCalledTimes(2);
  });

  it('does not reload while offline', () => {
    const onLine = jest
      .spyOn(navigator, 'onLine', 'get')
      .mockReturnValue(false);
    const app = loadPage();

    app.changePath();
    app.failChunk();
    app.changePath();
    jest.runAllTimers();
    onLine.mockRestore();

    expect(reload).not.toHaveBeenCalled();
  });

  it('reports errors again if the reload is cancelled', () => {
    const app = loadPage();

    app.failChunk();
    app.changePath();
    jest.advanceTimersByTime(5_000);

    expect(app.isReloadingForNewBuild()).toBe(false);
  });

  it('restarts the cancel timeout when another reload starts', () => {
    const app = loadPage();

    app.changePath();
    app.failChunk();
    jest.advanceTimersByTime(3_000);
    app.changePath();
    jest.advanceTimersByTime(3_000);

    expect(app.isReloadingForNewBuild()).toBe(true);
  });

  it('ignores search-only navigations after a chunk failed', () => {
    const app = loadPage();

    app.failChunk();
    app.changeSearch();
    jest.runAllTimers();

    expect(reload).not.toHaveBeenCalled();
    expect(app.isReloadingForNewBuild()).toBe(false);
  });

  it('does not reload when a chunk fails right after a search-only navigation', () => {
    const app = loadPage();

    app.changeSearch();
    app.failChunk();

    expect(reload).not.toHaveBeenCalled();
  });

  it('navigates normally while the build is current', () => {
    const app = loadPage();

    app.changePath();
    jest.runAllTimers();

    expect(reload).not.toHaveBeenCalled();
  });
});
