import React from 'react';

import { IdMethodData } from 'api/id_methods/types';

import { render, screen } from 'utils/testUtils/rtl';

import SSOEnforcedLink from './SSOEnforcedLink';

let mockIdMethods: { data: IdMethodData[] } = { data: [] };
let mockPathname = '/en/sign-in';

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: mockIdMethods }))
);

jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useLocation: () => ({ pathname: mockPathname }),
}));

jest.mock('utils/cl-router/Link');

const okta = (visibility?: 'show' | 'link' | 'hide'): IdMethodData => ({
  id: 'okta',
  type: 'id_method',
  attributes: {
    name: 'okta',
    authentication_method: true,
    verification_method: false,
    visibility,
  },
});

const queryLink = () =>
  screen.queryByRole('link', { name: /sign in with single sign-on/i });

describe('SSOEnforcedLink', () => {
  beforeEach(() => {
    mockPathname = '/en/sign-in';
  });

  it.each(['link', 'hide'] as const)(
    'links to the admin sign-in page when the staff method has "%s" visibility',
    (visibility) => {
      mockIdMethods = { data: [okta(visibility)] };
      render(<SSOEnforcedLink />);

      expect(queryLink()).toHaveAttribute('href', '/en/sign-in/admin');
    }
  );

  it('renders nothing when the staff method button is already shown', () => {
    mockIdMethods = { data: [okta('show')] };
    render(<SSOEnforcedLink />);

    expect(queryLink()).not.toBeInTheDocument();
  });

  it('renders nothing on the admin sign-in page itself', () => {
    mockPathname = '/en/sign-in/admin';
    mockIdMethods = { data: [okta('hide')] };
    render(<SSOEnforcedLink />);

    expect(queryLink()).not.toBeInTheDocument();
  });
});
