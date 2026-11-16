import React from 'react';

import { GLOBAL_CONTEXT } from 'api/authentication/authentication_requirements/constants';
import { IdMethodData } from 'api/id_methods/types';

import { State } from 'containers/Authentication/typings';

import { render, screen } from 'utils/testUtils/rtl';

import FlowStart from '.';

let mockVerificationRequired = false;
let mockIdMethods: IdMethodData[] = [];

jest.mock(
  'api/authentication/authentication_requirements/useAuthenticationRequirements',
  () =>
    jest.fn(() => ({
      data: {
        data: {
          attributes: {
            requirements: { verification: mockVerificationRequired },
          },
        },
      },
    }))
);

jest.mock('api/id_methods/useIdMethods', () =>
  jest.fn(() => ({ data: { data: mockIdMethods } }))
);

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => false));
jest.mock('hooks/useSuperAdmin', () => jest.fn(() => false));

jest.mock('utils/router', () => ({
  useLocation: () => ({ pathname: '/en/sign-in' }),
}));

// Stubbed: only which SSO buttons are rendered matters here.
jest.mock(
  'containers/Authentication/steps/FlowStart/_components/SSOButtonsExceptFC/SSOButton',
  () =>
    ({ provider }: { provider: string }) =>
      <div>{`sso-button-${provider}`}</div>
);
jest.mock(
  'containers/Authentication/steps/FlowStart/_components/VerificationWarning',
  () => () => null
);

const state = {
  flow: 'signin',
  email: null,
  phone: null,
  new_email: null,
  new_phone: null,
  smsManualCampaignConsent: false,
  token: null,
  prefilledBuiltInFields: null,
  ssoProvider: null,
  claimTokens: null,
} satisfies State;

const nemlogIn = (onlyShowForVerification?: boolean): IdMethodData => ({
  id: 'nemlog_in',
  type: 'id_method',
  attributes: {
    name: 'nemlog_in',
    authentication_method: true,
    verification_method: true,
    only_show_for_verification: onlyShowForVerification,
  },
});

const google: IdMethodData = {
  id: 'google',
  type: 'id_method',
  attributes: {
    name: 'google',
    authentication_method: true,
    verification_method: false,
  },
};

const renderFlowStart = () =>
  render(
    <FlowStart
      loading={false}
      state={state}
      setError={jest.fn()}
      authenticationData={{ context: GLOBAL_CONTEXT }}
      onSubmitEmail={jest.fn()}
      onSubmitPhone={jest.fn()}
      onSwitchToSSO={jest.fn()}
    />
  );

beforeEach(() => {
  mockVerificationRequired = false;
  mockIdMethods = [];
});

describe('<FlowStart />', () => {
  describe('when verification is not required', () => {
    it('shows NemLog-in when it is not set to only show for verification', () => {
      mockIdMethods = [nemlogIn(), google];
      renderFlowStart();
      expect(screen.getByText('sso-button-nemlog_in')).toBeInTheDocument();
      expect(screen.getByText('sso-button-google')).toBeInTheDocument();
    });

    it('hides NemLog-in when it is set to only show for verification', () => {
      mockIdMethods = [nemlogIn(true), google];
      renderFlowStart();
      expect(
        screen.queryByText('sso-button-nemlog_in')
      ).not.toBeInTheDocument();
      expect(screen.getByText('sso-button-google')).toBeInTheDocument();
    });
  });

  describe('when verification is required', () => {
    it('shows NemLog-in even when it is set to only show for verification', () => {
      mockVerificationRequired = true;
      mockIdMethods = [nemlogIn(true), google];
      renderFlowStart();
      expect(screen.getByText('sso-button-nemlog_in')).toBeInTheDocument();
      expect(screen.getByText('sso-button-google')).toBeInTheDocument();
    });
  });
});
