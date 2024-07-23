import React from 'react';

import PoliciesForm from '../Policies/PoliciesForm';

interface Props {
  loading: boolean;
  onAccept: () => void;
}

const SSOVerificationPolicies = ({ loading, onAccept }: Props) => {
  return <PoliciesForm loading={loading} onSubmit={onAccept} />;
};

export default SSOVerificationPolicies;
