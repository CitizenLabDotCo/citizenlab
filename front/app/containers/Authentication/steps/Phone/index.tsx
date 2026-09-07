import React, { useMemo } from 'react';

import { Box, Text, Button } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object, boolean } from 'yup';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SetError, State } from 'containers/Authentication/typings';

import PhoneInput from 'components/HookForm/PhoneInput';
import isValidPhoneNumber from 'components/HookForm/PhoneInput/isValidPhoneNumber';
import ConsentDisclosure from 'components/SmsConsent/ConsentDisclosure';
import ManualCampaignConsent from 'components/SmsConsent/ManualCampaignConsent';
import smsConsentMessages from 'components/SmsConsent/messages';
import { FormLabel } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';

import sharedMessages from '../messages';

import messages from './messages';
import { FormValues } from './types';

interface Props {
  state: State;
  loading: boolean;
  setError: SetError;
  onSubmit: (phone: string, smsManualCampaignConsent: boolean) => Promise<void>;
}

const Phone = ({ state, loading, setError, onSubmit }: Props) => {
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();
  const smsManualCampaignsEnabled = useFeatureFlag({
    name: 'sms_manual_campaigns',
  });

  const schema = useMemo(
    () =>
      object({
        new_phone: string()
          .required(formatMessage(messages.phoneNumberMissingError))
          .test(
            'is-valid-phone',
            formatMessage(messages.phoneNumberFormatError),
            (value) => (value ? isValidPhoneNumber(value) : false)
          ),
        smsManualCampaignConsent: boolean().default(false),
      }),
    [formatMessage]
  );

  const newPhone = state.new_phone ?? authUser?.data.attributes.new_phone;

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: {
      new_phone: newPhone ?? '',
      smsManualCampaignConsent: state.smsManualCampaignConsent,
    },
    resolver: yupResolver(schema),
    shouldFocusError: true,
  });

  const handleSubmit = async ({
    new_phone,
    smsManualCampaignConsent,
  }: FormValues) => {
    try {
      await onSubmit(new_phone, smsManualCampaignConsent);
    } catch (e) {
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      setError('unknown');
    }
  };

  return (
    <Box>
      <FormProvider {...methods}>
        <form noValidate onSubmit={methods.handleSubmit(handleSubmit)}>
          <Text mt="0px" mb="32px" color="tenantText">
            {formatMessage(messages.enterYourPhoneNumber)}
          </Text>
          <Box data-cy="phone-number-input">
            <FormLabel
              labelMessage={messages.phoneNumber}
              htmlFor="new_phone"
            />
            <PhoneInput name="new_phone" />
          </Box>
          <Box mt="20px" mb="8px">
            <ManualCampaignConsent />
          </Box>
          <Box w="100%" display="flex" mt="32px">
            <Button
              dataCy="phone-continue-button"
              type="submit"
              width="100%"
              disabled={loading}
              processing={loading}
            >
              {formatMessage(sharedMessages.continue)}
            </Button>
          </Box>
          <ConsentDisclosure
            disclosureMessage={
              smsManualCampaignsEnabled
                ? smsConsentMessages.phoneConfirmationDisclosureWithCampaignsEnabled
                : smsConsentMessages.phoneConfirmationDisclosureWithoutCampaignsEnabled
            }
          />
        </form>
      </FormProvider>
    </Box>
  );
};

export default Phone;
