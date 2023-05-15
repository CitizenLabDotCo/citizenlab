import React from 'react';

// components
import { Text } from '@citizenlab/cl2-component-library';
import PoliciesMarkup from './PoliciesMarkup';
import Button from 'components/UI/Button';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import sharedMessages from '../messages';
import authProvidersMessages from 'containers/Authentication/steps/AuthProviders/messages';

// form
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { object, boolean } from 'yup';

const DEFAULT_VALUES = {
  termsAndConditionsAccepted: false,
  privacyPolicyAccepted: false,
} as const;

const isTruthy = (value?: boolean) => !!value;

interface Props {
  loading: boolean;
  onSubmit: () => void;
}

const PoliciesForm = ({ loading, onSubmit }: Props) => {
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
        <PoliciesMarkup />
        <Button
          id="e2e-policies-continue"
          mt="32px"
          type="submit"
          width="100%"
          disabled={loading}
          processing={loading}
        >
          {formatMessage(sharedMessages.continue)}
        </Button>
      </form>
    </FormProvider>
  );
};

export default PoliciesForm;
