import React from 'react';

// components
import PoliciesForm from './PoliciesForm';

// typings
import { Status } from '../../typings';

interface Props {
  status: Status;
  onAccept: () => void;
}

const AzureAdPolicies = ({ status, onAccept }: Props) => {
  return <PoliciesForm status={status} onSubmit={onAccept} />;
};

export default AzureAdPolicies;
