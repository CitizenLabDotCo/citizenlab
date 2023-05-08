import React from 'react';

// components
import PoliciesForm from './PoliciesForm';

interface Props {
  loading: boolean;
  onAccept: () => void;
}

const GooglePolicies = ({ loading, onAccept }: Props) => {
  return <PoliciesForm loading={loading} onSubmit={onAccept} />;
};

export default GooglePolicies;
