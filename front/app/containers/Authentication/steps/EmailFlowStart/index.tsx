import React from 'react';

import { SSOProvider } from 'api/authentication/singleSignOn';
import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';

import { AuthenticationData, SetError } from 'containers/Authentication/typings';

import DefaultVariant from './DefaultVariant';
import VerificationVariant from './VerificationVariant';

interface Props {
  loading: boolean;
  setError: SetError;
  authenticationData: AuthenticationData;
  onSubmit: (email: string) => void;
  onSwitchToSSO: (ssoProvider: SSOProvider) => void;
}

const EmailFlowStart = ({ authenticationData, ...props }: Props) => {
  const { context } = authenticationData;
  const phaseId = context.type === 'phase' ? context.id : undefined;

  const { data: permissions } = usePhasePermissions({ phaseId });
  const permission = permissions?.data.find(
    (p) => p.attributes.action === context.action
  );

  console.log({ phaseId })

  const requireVerification =
    permission?.attributes.require_verification ?? false;

  return requireVerification ? (
    <VerificationVariant {...props} />
  ) : (
    <DefaultVariant {...props} />
  );
};

export default EmailFlowStart;
