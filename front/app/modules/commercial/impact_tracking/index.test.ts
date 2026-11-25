import { BehaviorSubject, Subject } from 'rxjs';

import { IUser } from 'api/users/types';

// These tests describe when the session gets upgraded, only through what the module
// can observe from the outside: whether the visitor is signed in (the API's answer to
// /users/me, and the auth cookie), and the current-user stream. They don't depend on
// how the module finds out whether the visitor is signed in.

// Is the browser signed in? The API sets (or clears) the auth cookie and the
// signed-in cookie together.
let signedInOnServer = false;
const user = { data: { id: 'user-id', type: 'user' } } as unknown as IUser;

// What tracking a page view fails with, if anything.
let pageViewError: unknown = null;

const mockFetcher = jest.fn(({ path }: { path: string }) => {
  if (path.endsWith('/track_pageview') && pageViewError) {
    return Promise.reject(pageViewError);
  }
  return Promise.resolve(
    path === '/users/me' && signedInOnServer ? user : null
  );
});
jest.mock('utils/cl-react-query/fetcher', () => ({
  __esModule: true,
  default: (args: { path: string }) => mockFetcher(args),
}));

jest.mock('utils/auth/signedInCookie', () => ({
  hasSignedInCookie: () => signedInOnServer,
}));

let mockAuthUserStream: BehaviorSubject<IUser | null | undefined>;
jest.mock('api/me/authUserStream', () => ({
  __esModule: true,
  get default() {
    return mockAuthUserStream;
  },
}));

jest.mock('utils/analytics', () => ({
  pageChanges$: new Subject(),
  virtualPageViews$: new Subject(),
}));
jest.mock('containers/App/constants', () => ({
  API_PATH: '/web_api/v1',
  locales: ['en'],
}));
jest.mock('utils/getRoutePattern', () => ({ getRoutePattern: jest.fn() }));

const upgradeCount = () =>
  mockFetcher.mock.calls.filter(
    ([{ path }]) => path === '/sessions/current/upgrade'
  ).length;

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

// Loads the app with the visitor signed in or not, as on a fresh page load.
const loadPage = async ({ signedIn }: { signedIn: boolean }) => {
  signedInOnServer = signedIn;
  // The current user is still loading.
  mockAuthUserStream = new BehaviorSubject<IUser | null | undefined>(undefined);

  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('.').default.beforeMountApplication();
  });
  await flushPromises();

  // The app's current-user query answers.
  mockAuthUserStream.next(signedIn ? user : null);
  await flushPromises();
};

// The API sets (or clears) the auth cookie, then the app reloads the current user.
const signIn = async () => {
  signedInOnServer = true;
  mockAuthUserStream.next(user);
  await flushPromises();
};

const signOut = async () => {
  signedInOnServer = false;
  mockAuthUserStream.next(undefined); // the current user is reset
  mockAuthUserStream.next(null);
  await flushPromises();
};

const refetchUser = async () => {
  mockAuthUserStream.next({ ...user });
  await flushPromises();
};

describe('impact tracking: session upgrade', () => {
  beforeEach(() => {
    mockFetcher.mockClear();
  });

  it('upgrades the session once when a visitor signs in', async () => {
    await loadPage({ signedIn: false });
    await signIn();

    expect(upgradeCount()).toBe(1);
  });

  it('does not upgrade again when the signed-in user is refetched', async () => {
    await loadPage({ signedIn: false });
    await signIn();
    await refetchUser();
    await refetchUser();

    expect(upgradeCount()).toBe(1);
  });

  it('does not upgrade for a visitor who stays signed out', async () => {
    await loadPage({ signedIn: false });
    mockAuthUserStream.next(null);
    await flushPromises();

    expect(upgradeCount()).toBe(0);
  });

  it('does not upgrade for a user who was signed in when the page loaded', async () => {
    await loadPage({ signedIn: true });
    await refetchUser();

    expect(upgradeCount()).toBe(0);
  });

  it('upgrades again after signing out and back in', async () => {
    await loadPage({ signedIn: false });
    await signIn();
    await signOut();
    await signIn();

    expect(upgradeCount()).toBe(2);
  });

  it('upgrades when a user signed in at page load signs out and back in', async () => {
    await loadPage({ signedIn: true });
    await signOut();
    expect(upgradeCount()).toBe(0);

    await signIn();
    expect(upgradeCount()).toBe(1);
  });

  // While the app reloads the current user, the stream first gets the old value
  // (still signed out). The upgrade must not wait for /users/me to answer.
  it('upgrades as soon as the app starts reloading the user after signing in', async () => {
    await loadPage({ signedIn: false });

    signedInOnServer = true;
    mockAuthUserStream.next(null);
    await flushPromises();

    expect(upgradeCount()).toBe(1);
  });

  // The CI failure: the app's first answer (signed out) never reaches the stream,
  // because signing up reloads the current user before that answer came in.
  it('upgrades when the stream goes straight from loading to the signed-in user', async () => {
    signedInOnServer = false;
    mockAuthUserStream = new BehaviorSubject<IUser | null | undefined>(
      undefined
    );
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('.').default.beforeMountApplication();
    });
    await flushPromises();

    await signIn();

    expect(upgradeCount()).toBe(1);
  });
});

// Jest fails a test on any unhandled rejection, which is what Sentry reports.
describe('impact tracking: failed requests', () => {
  // Starts a session and returns the subject the app sends page changes to.
  const startSession = async () => {
    signedInOnServer = false;
    mockAuthUserStream = new BehaviorSubject<IUser | null | undefined>(null);
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
      json: () => Promise.resolve({ data: { id: 'session-id' } }),
    });

    let pageChanges$: Subject<{ path: string }> | undefined;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('.').default.beforeMountApplication();
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      pageChanges$ = require('utils/analytics').pageChanges$;
    });
    pageChanges$?.next({ path: '/en' });
    await flushPromises();
    return pageChanges$;
  };

  beforeEach(() => {
    mockFetcher.mockClear();
  });

  afterEach(() => {
    pageViewError = null;
  });

  it('sends tracking requests with keepalive, so they survive a redirect', async () => {
    await startSession();

    expect(global.fetch).toHaveBeenCalledWith(
      '/web_api/v1/sessions',
      expect.objectContaining({ keepalive: true })
    );
    expect(mockFetcher).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/sessions/session-id/track_pageview',
        keepalive: true,
      })
    );
  });

  it('ignores page views that fail because of the network', async () => {
    pageViewError = new TypeError('Load failed');
    const pageChanges$ = await startSession();
    pageChanges$?.next({ path: '/en/projects' });
    await flushPromises();

    expect(mockFetcher).toHaveBeenCalledWith(
      expect.objectContaining({ path: '/sessions/session-id/track_pageview' })
    );
  });

  it('ignores the network error of every browser engine', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ignoreNetworkErrors } = require('.');
    [
      'Failed to fetch',
      'Load failed',
      'NetworkError when attempting to fetch resource.',
      // As rewritten by Sentry's fetch instrumentation.
      'Load failed (example.org)',
    ].forEach((message) => {
      expect(() => ignoreNetworkErrors(new TypeError(message))).not.toThrow();
    });
  });

  it('still surfaces a TypeError from a bug in our code', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ignoreNetworkErrors } = require('.');
    const bug = new TypeError(
      "Cannot read properties of undefined (reading 'id')"
    );

    expect(() => ignoreNetworkErrors(bug)).toThrow(bug);
  });
});
