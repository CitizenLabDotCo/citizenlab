import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { object, boolean } from 'yup';

import authProvidersMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import sharedMessages from '../messages';

import messages from './messages';
import PoliciesMarkup from './PoliciesMarkup';

const DEFAULT_VALUES = {
  policiesAccepted: false,
  smsManualCampaignConsent: false,
};

const isTruthy = (value?: boolean) => !!value;

export interface FormValues {
  policiesAccepted: boolean;
  smsManualCampaignConsent: boolean;
}

interface Props {
  loading: boolean;
  showByContinuingText?: boolean;
  showSmsManualCampaignConsent?: boolean;
  onSubmit: (values: FormValues) => void;
  byContinuingCopy?: string;
}

const PoliciesForm = ({
  loading,
  showByContinuingText,
  showSmsManualCampaignConsent,
  byContinuingCopy,
  onSubmit,
}: Props) => {
  const { formatMessage } = useIntl();

  const schema = object({
    policiesAccepted: boolean()
      .defined()
      .test(
        '',
        formatMessage(authProvidersMessages.policiesNotAcceptedError),
        isTruthy
      ),
    smsManualCampaignConsent: boolean().defined(),
  });

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES,
    resolver: yupResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={methods.handleSubmit(onSubmit)}>
        <Text mt="0px" mb="32px">
          {formatMessage(messages.reviewTheTerms)}
        </Text>
        <PoliciesMarkup
          showByContinuingText={showByContinuingText}
          showSmsManualCampaignConsent={showSmsManualCampaignConsent}
          byContinuingCopy={byContinuingCopy}
        />
        <ButtonWithLink
          id="e2e-policies-continue"
          mt="32px"
          type="submit"
          width="100%"
          disabled={loading}
          processing={loading}
          ariaDescribedby={
            showByContinuingText !== false
              ? 'email-consent-description'
              : undefined
          }
        >
          {formatMessage(sharedMessages.continue)}
        </ButtonWithLink>
      </form>
    </FormProvider>
  );
};

export default PoliciesForm;
