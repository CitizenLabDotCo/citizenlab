import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { object, boolean } from 'yup';

import authProvidersMessages from 'containers/Authentication/steps/AuthProviders/messages';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../messages';

import messages from './messages';
import PoliciesMarkup from './PoliciesMarkup';

const DEFAULT_VALUES = {
  termsAndConditionsAccepted: false,
  privacyPolicyAccepted: false,
} as const;

const isTruthy = (value?: boolean) => !!value;

interface Props {
  loading: boolean;
  showByContinuingText?: boolean;
  onSubmit: () => void;
}

const PoliciesForm = ({ loading, showByContinuingText, onSubmit }: Props) => {
  const { formatMessage } = useIntl();

  const schema = object({
    termsAndConditionsAccepted: boolean().test(
      '',
      formatMessage(authProvidersMessages.tacError),
      isTruthy
    ),
    privacyPolicyAccepted: boolean().test(
      '',
      formatMessage(authProvidersMessages.privacyPolicyNotAcceptedError),
      isTruthy
    ),
  });

  const methods = useForm({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <Text mt="0px" mb="32px">
          {formatMessage(messages.reviewTheTerms)}
        </Text>
        <PoliciesMarkup showByContinuingText={showByContinuingText} />
        <ButtonWithLink
          id="e2e-policies-continue"
          mt="32px"
          type="submit"
          width="100%"
          disabled={loading}
          processing={loading}
        >
          {formatMessage(sharedMessages.continue)}
        </ButtonWithLink>
      </form>
    </FormProvider>
  );
};

export default PoliciesForm;
