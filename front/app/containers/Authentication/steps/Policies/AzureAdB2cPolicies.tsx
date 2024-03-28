import React from 'react';

import PoliciesForm from './PoliciesForm';

interface Props {
  loading: boolean;
  onAccept: () => void;
}

const AzureAdPolicies = ({ loading, onAccept }: Props) => {
  return <PoliciesForm loading={loading} onSubmit={onAccept} />;
};

export default AzureAdPolicies;
