import React from 'react';

import { SSOProvider } from 'api/authentication/singleSignOn';

import { State } from 'containers/Authentication/typings';

import PoliciesForm from '../Policies/PoliciesForm';

interface Props {
  state: State;
  loading: boolean;
  onAccept: (ssoProvider: SSOProvider) => void;
}

const SSOVerificationPolicies = ({ state, loading, onAccept }: Props) => {
  const { ssoProvider } = state;
  if (!ssoProvider) return null;

  return (
    <PoliciesForm
      loading={loading}
      showByContinuingText={false}
      onSubmit={() => onAccept(ssoProvider)}
    />
  );
};

export default SSOVerificationPolicies;
