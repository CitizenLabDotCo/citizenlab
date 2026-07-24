import { captureMessage } from '@sentry/react';

import {
  forgetJwt,
  rememberJwt,
  reportUnexpectedJwtLoss,
} from './reportJwtLoss';

jest.mock('@sentry/react', () => ({
  __esModule: true,
  captureMessage: jest.fn(),
  // Run the callback against a scope stub so setTags/setContext are exercised.
  withScope: jest.fn((callback) =>
    callback({
      setLevel: jest.fn(),
      setTags: jest.fn(),
      setContext: jest.fn(),
    })
  ),
}));

// jwt-decode is not mocked: the util must cope with real tokens, and an
// unparseable one must not throw.
const tokenExpiringIn = (seconds: number) => {
  const payload = { exp: Math.floor(Date.now() / 1000) + seconds };
  return `header.${btoa(JSON.stringify(payload))}.signature`;
};

describe('reportUnexpectedJwtLoss', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    forgetJwt();
  });

  it('reports when a still-valid token disappears', () => {
    rememberJwt(tokenExpiringIn(3600));

    reportUnexpectedJwtLoss();

    expect(captureMessage).toHaveBeenCalledTimes(1);
  });

  it('reports only once, since getJwt runs on every request', () => {
    rememberJwt(tokenExpiringIn(3600));

    reportUnexpectedJwtLoss();
    reportUnexpectedJwtLoss();
    reportUnexpectedJwtLoss();

    expect(captureMessage).toHaveBeenCalledTimes(1);
  });

  it('does not report an expired token, which the browser drops normally', () => {
    rememberJwt(tokenExpiringIn(-60));

    reportUnexpectedJwtLoss();

    expect(captureMessage).not.toHaveBeenCalled();
  });

  it('does not report after a deliberate sign-out', () => {
    rememberJwt(tokenExpiringIn(3600));
    forgetJwt();

    reportUnexpectedJwtLoss();

    expect(captureMessage).not.toHaveBeenCalled();
  });

  it('does not report when no token was ever seen', () => {
    reportUnexpectedJwtLoss();

    expect(captureMessage).not.toHaveBeenCalled();
  });

  it('does not throw on an undecodable token', () => {
    expect(() => rememberJwt('not-a-jwt')).not.toThrow();

    reportUnexpectedJwtLoss();

    expect(captureMessage).not.toHaveBeenCalled();
  });
});
