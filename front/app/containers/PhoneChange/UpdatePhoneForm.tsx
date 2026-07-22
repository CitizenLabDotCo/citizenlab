import React, { useState } from 'react';

import { Box, Success } from '@citizenlab/cl2-component-library';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { requestCodePhoneChange } from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import { IUser } from 'api/users/types';

import PhoneInput from 'components/HookForm/PhoneInput';
import {
  Title,
  StyledButton,
  Form,
  LabelContainer,
} from 'components/smallForm';
import Error from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import messages from './messages';

import { FormValues } from '.';

type UpdatePhoneFormProps = {
  updateSuccessful: boolean;
  setOpenConfirmationModal: (openConfirmationModal: boolean) => void;
  methods: UseFormReturn<FormValues, any>;
  user: IUser;
};

type FormError = 'taken' | 'invalid' | 'unsupported_country' | 'unknown';

const ERROR_MESSAGES = {
  taken: messages.phoneTaken,
  invalid: messages.phoneInvalid,
  unsupported_country: messages.phoneUnsupportedCountry,
  unknown: messages.phoneUnknownError,
};

const UpdatePhoneForm = ({
  updateSuccessful,
  setOpenConfirmationModal,
  methods,
  user,
}: UpdatePhoneFormProps) => {
  const { formatMessage } = useIntl();
  const { data: appConfig } = useAppConfiguration();
  const [error, setError] = useState<FormError | undefined>(undefined);
  const currentPhone = user.data.attributes.phone;

  const allowedCountryCodes =
    appConfig?.data.attributes.settings.sms?.allowed_country_codes;
  // Restrict the country dropdown when an allow-list is configured; otherwise show all countries.
  const allowedCountries =
    allowedCountryCodes && allowedCountryCodes.length > 0
      ? allowedCountryCodes
      : undefined;
  // Default the selected country (and thus the pre-filled calling code) to the
  // first allowed country, falling back to the platform's own country. This keeps
  // the "+…" prefix relevant instead of defaulting to an unrelated country.
  const tenantCountryCode =
    appConfig?.data.attributes.settings.core.country_code;
  const defaultCountry =
    allowedCountries?.[0] ?? tenantCountryCode ?? undefined;

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      return requestCodePhoneChange(formValues.phone)
        .then(() => {
          setOpenConfirmationModal(true);
          setError(undefined);
        })
        .catch((e) => {
          const errorCode = e?.errors?.new_phone?.[0]?.error;
          if (errorCode === 'is already taken') {
            setError('taken');
          } else if (errorCode === 'is invalid') {
            setError('invalid');
          } else if (errorCode === 'unsupported_country') {
            setError('unsupported_country');
          } else {
            setError('unknown');
          }
        });
    } catch (submissionError) {
      handleHookFormSubmissionError(submissionError, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <Title>
        {currentPhone
          ? formatMessage(messages.titleChangePhone)
          : formatMessage(messages.titleAddPhone)}
      </Title>
      <Form>
        {currentPhone && (
          <Warning mt="-20px" mb="20px">
            <>
              {formatMessage(messages.currentPhone)}{' '}
              <strong>{currentPhone}</strong>
            </>
          </Warning>
        )}
        <LabelContainer>
          <FormLabel
            width="max-content"
            margin-right="5px"
            labelMessage={messages.newPhoneLabel}
            htmlFor="phone"
          />
        </LabelContainer>
        <PhoneInput
          name="phone"
          countries={allowedCountries}
          defaultCountry={defaultCountry}
          onBlur={() => {
            setError(undefined);
          }}
        />
        {error && (
          <Error marginTop="4px" text={formatMessage(ERROR_MESSAGES[error])} />
        )}
        <StyledButton
          type="submit"
          size="m"
          processing={methods.formState.isSubmitting}
          onClick={methods.handleSubmit(onFormSubmit)}
          text={formatMessage(messages.submitButton)}
          dataCy="change-phone-submit-button"
        />
      </Form>
      <Box display="flex" justifyContent="center">
        {updateSuccessful && (
          <Success text={formatMessage(messages.updateSuccessful)} />
        )}
      </Box>
    </FormProvider>
  );
};

export default UpdatePhoneForm;
