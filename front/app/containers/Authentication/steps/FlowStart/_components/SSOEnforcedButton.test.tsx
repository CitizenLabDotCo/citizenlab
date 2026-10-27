import React from 'react';

import { IdMethodData } from 'api/id_methods/types';

import { render, screen } from 'utils/testUtils/rtl';

import SSOEnforcedButton from './SSOEnforcedButton';

let mockIdMethods: { data: IdMethodData[] } = { data: [] };
let mockPathname = '/en/sign-in';

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: mockIdMethods }))
);

jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useLocation: () => ({ pathname: mockPathname }),
}));

// Stubbed: how each provider's button looks is SSOButton's concern.
jest.mock('./SSOButtonsExceptFC/SSOButton', () => ({ provider }) => (
  <div>{`${provider}-button`}</div>
));

const baseAttributes = {
  authentication_method: true,
  verification_method: false,
};

const okta = (visibility?: 'show' | 'link' | 'hide'): IdMethodData => ({
  id: 'okta',
  type: 'id_method',
  attributes: { ...baseAttributes, name: 'okta', visibility },
});

const azure = (visibility?: 'show' | 'link' | 'hide'): IdMethodData => ({
  id: 'azure',
  type: 'id_method',
  attributes: { ...baseAttributes, name: 'azureactivedirectory', visibility },
});

const ssoError = (idMethod: string) => ({
  error: 'sso_enforced_for_domain',
  payload: { id_method: idMethod },
});

const renderButton = (idMethod: string) =>
  render(
    <SSOEnforcedButton error={ssoError(idMethod)} onClickSSO={jest.fn()} />
  );

describe('SSOEnforcedButton', () => {
  beforeEach(() => {
    mockPathname = '/en/sign-in';
  });

  it.each(['link', 'hide'] as const)(
    'shows the button of the enforcing method when it has "%s" visibility',
    (visibility) => {
      mockIdMethods = { data: [okta(visibility)] };
      renderButton('okta');

      expect(screen.getByText('okta-button')).toBeInTheDocument();
    }
  );

  it('shows the enforcing method, not another hidden staff method', () => {
    mockIdMethods = {
      data: [azure('show'), okta('hide')],
    };
    renderButton('okta');

    expect(screen.getByText('okta-button')).toBeInTheDocument();
    expect(
      screen.queryByText('azureactivedirectory-button')
    ).not.toBeInTheDocument();
  });

  it('renders nothing when the enforcing method is already shown', () => {
    mockIdMethods = {
      data: [azure('show'), okta('hide')],
    };
    renderButton('azureactivedirectory');

    expect(screen.queryByText(/-button/)).not.toBeInTheDocument();
  });

  it('renders nothing on the admin sign-in page, where every method is shown', () => {
    mockPathname = '/en/sign-in/admin';
    mockIdMethods = { data: [okta('hide')] };
    renderButton('okta');

    expect(screen.queryByText(/-button/)).not.toBeInTheDocument();
  });

  it('renders nothing when the error names no configured staff method', () => {
    mockIdMethods = { data: [okta('hide')] };
    renderButton('google');

    expect(screen.queryByText(/-button/)).not.toBeInTheDocument();
  });
});
