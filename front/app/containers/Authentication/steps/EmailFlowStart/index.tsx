import React from 'react';

import useAuthenticationRequirements from 'api/authentication/authentication_requirements/useAuthenticationRequirements';
import { SSOProvider } from 'api/authentication/singleSignOn';

import { AuthenticationData, SetError } from 'containers/Authentication/typings';

import DefaultVariant from './DefaultVariant';
import useSSOProviders from './SSOButtonsExceptFC/providers';
import VerificationVariant from './VerificationVariant';

interface Props {
  loading: boolean;
  setError: SetError;
  authenticationData: AuthenticationData;
  onSubmit: (email: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

const EmailFlowStart = ({ authenticationData, ...props }: Props) => {
  const { data: requirements } = useAuthenticationRequirements(
    authenticationData.context
  );
  const { hasVerificationMethod } = useSSOProviders();

  const verificationRequired =
    requirements?.data.attributes.requirements.verification ?? false;

  // Only show the verification interface when verification is required AND there
  // is at least one method that can actually verify.
  return verificationRequired && hasVerificationMethod ? (
    <VerificationVariant {...props} />
  ) : (
    <DefaultVariant {...props} />
  );
};

export default EmailFlowStart;
