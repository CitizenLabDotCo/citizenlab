import React from 'react';

// hooks
import useLocale from 'hooks/useLocale';

// components
import PoliciesForm from './PoliciesForm';

// typings
import { State, Status } from '../../typings';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  state: State;
  status: Status;
  onAccept: (email: string, locale: string) => void;
}

const EmailPolicies = ({ state, status, onAccept }: Props) => {
  const locale = useLocale();
  const { email } = state;

  if (isNilOrError(locale) || email === null) return null;

  const handleSubmit = () => {
    onAccept(email, locale);
  };

  return <PoliciesForm status={status} onSubmit={handleSubmit} />;
};

export default EmailPolicies;
