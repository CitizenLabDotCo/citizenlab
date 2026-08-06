import React, { useState } from 'react';

import { Box, Success, Text } from '@citizenlab/cl2-component-library';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import { requestCodeNewPhone } from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import { IUser } from 'api/users/types';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';
import PhoneInput from 'components/HookForm/PhoneInput';
import usePhoneInputCountries from 'components/HookForm/PhoneInput/usePhoneInputCountries';
import {
  Title,
  StyledButton,
  Form,
  LabelContainer,
} from 'components/smallForm';
import Error from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';
import Warning from 'components/UI/Warning';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
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
  const { allowedCountries, defaultCountry } = usePhoneInputCountries();
  const [error, setError] = useState<FormError | undefined>(undefined);
  const currentPhone = user.data.attributes.phone;

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      return requestCodeNewPhone(formValues.phone)
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
        <Box mt="20px" mb="8px">
          <CheckboxWithLabel
            name="smsManualCampaignConsent"
            label={formatMessage(messages.smsManualCampaignConsentLabel)}
            dataTestId="sms-manual-campaign-consent"
          />
        </Box>
        <StyledButton
          type="submit"
          size="m"
          processing={methods.formState.isSubmitting}
          onClick={methods.handleSubmit(onFormSubmit)}
          text={formatMessage(messages.submitButton)}
          dataCy="change-phone-submit-button"
        />
        <Text
          fontSize="s"
          color="tenantText"
          data-testid="sms-confirmation-disclosure"
        >
          <FormattedMessage
            {...messages.smsConfirmationDisclosure}
            values={{
              termsLink: (
                <Link
                  target="_blank"
                  to="/pages/$slug"
                  params={{ slug: 'terms-and-conditions' }}
                >
                  <FormattedMessage {...messages.termsLinkText} />
                </Link>
              ),
              privacyLink: (
                <Link
                  target="_blank"
                  to="/pages/$slug"
                  params={{ slug: 'privacy-policy' }}
                >
                  <FormattedMessage {...messages.privacyLinkText} />
                </Link>
              ),
            }}
          />
        </Text>
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
