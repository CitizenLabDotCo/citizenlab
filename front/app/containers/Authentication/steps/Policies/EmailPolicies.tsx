import React from 'react';

import useLocale from 'hooks/useLocale';

import { isNilOrError } from 'utils/helperUtils';

import { SetError, State } from '../../typings';

import PoliciesForm from './PoliciesForm';

interface Props {
  state: State;
  loading: boolean;
  setError: SetError;
  onAccept: (email: string, locale: string) => void;
}

const EmailPolicies = ({ state, loading, setError, onAccept }: Props) => {
  const locale = useLocale();
  const { email } = state;

  if (isNilOrError(locale) || email === null) return null;

  const handleSubmit = async () => {
    try {
      await onAccept(email, locale);
    } catch (e) {
      setError('account_creation_failed');
    }
  };

  return <PoliciesForm loading={loading} onSubmit={handleSubmit} />;
};

export default EmailPolicies;
