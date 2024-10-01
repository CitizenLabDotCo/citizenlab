import React from 'react';

import { SSOProvider } from 'api/authentication/singleSignOn';

import { State } from '../../typings';

import PoliciesForm from './PoliciesForm';

interface Props {
  state: State;
  loading: boolean;
  onAccept: (ssoProvider: SSOProvider) => void;
}

const SSOPolicies = ({ state, loading, onAccept }: Props) => {
  const ssoProvider = state.ssoProvider;
  if (!ssoProvider) return null;

  const handleAccept = () => {
    onAccept(ssoProvider);
  };

  return <PoliciesForm loading={loading} onSubmit={handleAccept} />;
};

export default SSOPolicies;
