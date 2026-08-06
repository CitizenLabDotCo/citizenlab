import React, { useMemo } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import { string, object } from 'yup';

import { SetError } from 'containers/Authentication/typings';

import PhoneInput from 'components/HookForm/PhoneInput';
import isValidPhoneNumber from 'components/HookForm/PhoneInput/isValidPhoneNumber';
import usePhoneInputCountries from 'components/HookForm/PhoneInput/usePhoneInputCountries';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import { FormLabel } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';
import {
  isCLErrorsWrapper,
  handleHookFormSubmissionError,
} from 'utils/errorUtils';

import sharedMessages from '../messages';
import phoneMessages from '../Phone/messages';

interface FormValues {
  phone: string;
}

interface Props {
  loading: boolean;
  setError: SetError;
  onSubmit: (phone: string) => void;
}

const PhoneForm = ({ loading, setError, onSubmit }: Props) => {
  const { formatMessage } = useIntl();
  const { allowedCountries, defaultCountry } = usePhoneInputCountries();

  const schema = useMemo(
    () =>
      object({
        phone: string()
          .required(formatMessage(phoneMessages.phoneNumberMissingError))
          .test(
            'is-valid-phone',
            formatMessage(phoneMessages.phoneNumberFormatError),
            (value) => (value ? isValidPhoneNumber(value) : false)
          ),
      }),
    [formatMessage]
  );

  const methods = useForm<FormValues>({
    mode: 'onSubmit',
    defaultValues: { phone: '' },
    resolver: yupResolver(schema),
    shouldFocusError: true,
  });

  const handleSubmit = async ({ phone }: FormValues) => {
    try {
      await onSubmit(phone);
    } catch (e) {
      if (isCLErrorsWrapper(e)) {
        handleHookFormSubmissionError(e, methods.setError);
        return;
      }

      setError('unknown');
    }
  };

  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={methods.handleSubmit(handleSubmit)}>
        <Text mt="0px" mb="32px" color="tenantText">
          {formatMessage(phoneMessages.enterYourPhoneNumber)}
        </Text>
        <Box data-cy="phone-flow-start-phone-input">
          <FormLabel
            labelMessage={phoneMessages.phoneNumber}
            htmlFor="phone"
            width="max-content"
          />
          <PhoneInput
            name="phone"
            countries={allowedCountries}
            defaultCountry={defaultCountry}
          />
        </Box>
        <Box w="100%" display="flex" mt="32px">
          <ButtonWithLink
            dataCy="phone-flow-start-continue-button"
            type="submit"
            width="100%"
            disabled={loading}
            processing={loading}
          >
            {formatMessage(sharedMessages.continue)}
          </ButtonWithLink>
        </Box>
      </form>
    </FormProvider>
  );
};

export default PhoneForm;
