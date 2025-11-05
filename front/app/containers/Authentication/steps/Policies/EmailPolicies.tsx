import React from 'react';

import { Text, Icon, colors } from '@citizenlab/cl2-component-library';

import useLocale from 'hooks/useLocale';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import { SetError, State } from '../../typings';

import messages from './messages';
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

  return (
    <>
      <Text mt="0px" mb="28px">
        <Icon
          width="20px"
          height="20px"
          name="user-circle"
          fill={colors.textSecondary}
          mr="8px"
          transform="translate(0,-1)"
        />
        <FormattedMessage
          {...messages.createANewAccountWith}
          values={{
            email: <strong>{state.email}</strong>,
            changeLink: 'TODO',
          }}
        />
      </Text>
      <PoliciesForm loading={loading} onSubmit={handleSubmit} />
    </>
  );
};

export default EmailPolicies;
