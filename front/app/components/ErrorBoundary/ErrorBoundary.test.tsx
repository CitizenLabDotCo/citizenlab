import React from 'react';

import { render, screen } from 'utils/testUtils/rtl';

import ErrorBoundary from '.';

const scope = {
  setExtra: jest.fn(),
  setTags: jest.fn(),
  setContext: jest.fn(),
};

jest.mock('@sentry/react', () => ({
  __esModule: true,
  withScope: jest.fn((callback) => callback(scope)),
  showReportDialog: jest.fn(),
}));

jest.mock('utils/loggingUtils', () => ({
  reportError: jest.fn(),
}));

jest.mock('resources/GetAuthUser', () => ({
  __esModule: true,
  default: ({ children }) => children(null),
}));

const Crash = () => {
  throw new Error('boom');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('reports the crash with browser and page context', () => {
    render(
      <ErrorBoundary>
        <Crash />
      </ErrorBoundary>
    );

    expect(scope.setExtra).toHaveBeenCalledWith('from', 'ErrorBoundary');
    expect(scope.setTags).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_host: window.location.hostname,
        route: window.location.pathname,
        weglot_active: false,
        weglot_lang: 'none',
      })
    );
    expect(scope.setContext).toHaveBeenCalledWith(
      'error_boundary',
      expect.objectContaining({ user_agent: navigator.userAgent })
    );
  });

  it('offers to reload the page', () => {
    render(
      <ErrorBoundary>
        <Crash />
      </ErrorBoundary>
    );

    expect(
      screen.getByRole('button', { name: 'Reload the page' })
    ).toBeInTheDocument();
  });
});
