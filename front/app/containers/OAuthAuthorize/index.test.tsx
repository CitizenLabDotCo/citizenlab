import React from 'react';

import type {
  IOAuthAuthorizationRedirect,
  OAuthAuthorizationParams,
} from 'api/oauth_authorization/types';

import { screen, render, userEvent } from 'utils/testUtils/rtl';

const SAFE_REDIRECT_URI = 'https://client.example.com/oauth/callback';
// Parses as a URI with a host, so it survives naive validation; a browser runs
// `alert(...)` because `//x` comments out the rest of the line.
const HOSTILE_REDIRECT_URI = 'javascript://x%0Aalert(document.cookie)';

// Mutable per example. jest.mock factories may only close over names prefixed
// with `mock`, so these carry the scenario into the mocked hooks below.
let mockConsentRedirectUri = SAFE_REDIRECT_URI;
let mockApproveRedirectUri = SAFE_REDIRECT_URI;

jest.mock('api/me/useAuthUser', () =>
  jest.fn(() => ({ data: { id: 'user-1' }, isLoading: false }))
);

jest.mock('api/oauth_authorization/useOAuthAuthorization', () =>
  jest.fn(() => ({
    data: {
      data: {
        type: 'oauth_authorization',
        attributes: {
          client_id: 'client-1',
          client_name: 'Test MCP Client',
          scopes: ['mcp:access'],
          redirect_uri: mockConsentRedirectUri,
          params: { client_id: 'client-1', state: 'state-123' },
        },
      },
    },
    isLoading: false,
    isError: false,
  }))
);

// Approving hits the API and navigates to whatever redirect_uri comes back —
// which Doorkeeper builds from the same client-registered URI, so it is no more
// trustworthy than the one on the consent screen.
jest.mock('api/oauth_authorization/useCreateOAuthAuthorization', () =>
  jest.fn(() => ({
    mutate: (
      _params: OAuthAuthorizationParams,
      options?: { onSuccess?: (res: IOAuthAuthorizationRedirect) => void }
    ) => {
      options?.onSuccess?.({
        data: {
          type: 'oauth_authorization',
          attributes: { redirect_uri: mockApproveRedirectUri },
        },
      });
    },
    isPending: false,
  }))
);

jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useSearch: () => ({ client_id: 'client-1', state: 'state-123' }),
}));

// Only the browser call is stubbed — the scheme guard under test stays real.
const mockNavigateToUrl = jest.fn();
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  navigateToUrl: (url: string) => mockNavigateToUrl(url),
}));

import OAuthAuthorize from './index';

describe('OAuthAuthorize', () => {
  beforeEach(() => {
    mockConsentRedirectUri = SAFE_REDIRECT_URI;
    mockApproveRedirectUri = SAFE_REDIRECT_URI;
  });

  it('renders the consent screen for an http(s) redirect_uri', () => {
    render(<OAuthAuthorize />);

    expect(
      screen.getByRole('button', { name: 'Authorize' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('redirects the client back on deny', async () => {
    const user = userEvent.setup();
    render(<OAuthAuthorize />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockNavigateToUrl).toHaveBeenCalledWith(
      `${SAFE_REDIRECT_URI}?error=access_denied&state=state-123`
    );
  });

  it('redirects the client back on approve', async () => {
    const user = userEvent.setup();
    render(<OAuthAuthorize />);

    await user.click(screen.getByRole('button', { name: 'Authorize' }));

    expect(mockNavigateToUrl).toHaveBeenCalledWith(SAFE_REDIRECT_URI);
  });

  // The reported attack: a client registered with a javascript: redirect_uri,
  // executing in the platform origin as soon as the victim clicks deny.
  it('refuses the consent screen entirely for a non-http(s) redirect_uri', () => {
    mockConsentRedirectUri = HOSTILE_REDIRECT_URI;

    render(<OAuthAuthorize />);

    expect(
      screen.getByText('This authorization request is invalid')
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Authorize' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancel' })
    ).not.toBeInTheDocument();
    expect(mockNavigateToUrl).not.toHaveBeenCalled();
  });

  it('navigates nowhere when approving returns a non-http(s) redirect_uri', async () => {
    mockApproveRedirectUri = HOSTILE_REDIRECT_URI;
    const user = userEvent.setup();
    render(<OAuthAuthorize />);

    await user.click(screen.getByRole('button', { name: 'Authorize' }));

    expect(mockNavigateToUrl).not.toHaveBeenCalled();
    expect(
      await screen.findByText('This authorization request is invalid')
    ).toBeInTheDocument();
  });
});
