import React, { useState } from 'react';

import { Box, Success, fontSizes } from '@citizenlab/cl2-component-library';
import { FormProvider, UseFormReturn } from 'react-hook-form';
import styled from 'styled-components';

import { requestCodePhoneChange } from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import { IUser } from 'api/users/types';

import authProvidersMessages from 'containers/Authentication/steps/_components/AuthProviderButton/messages';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';
import Input from 'components/HookForm/Input';
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

const DisclosureText = styled.div`
  margin-top: 16px;
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.s}px;
  line-height: 21px;

  a {
    color: ${({ theme }) => theme.colors.tenantText};
    text-decoration: underline;
  }
`;

type UpdatePhoneFormProps = {
  updateSuccessful: boolean;
  setOpenConfirmationModal: (openConfirmationModal: boolean) => void;
  methods: UseFormReturn<FormValues, any>;
  user: IUser;
};

type FormError = 'taken' | 'invalid' | 'unknown';

const ERROR_MESSAGES = {
  taken: messages.phoneTaken,
  invalid: messages.phoneInvalid,
  unknown: messages.phoneUnknownError,
};

const UpdatePhoneForm = ({
  updateSuccessful,
  setOpenConfirmationModal,
  methods,
  user,
}: UpdatePhoneFormProps) => {
  const { formatMessage } = useIntl();
  const [error, setError] = useState<FormError | undefined>(undefined);
  const currentPhone = user.data.attributes.phone;

  // Return the promise so react-hook-form keeps `formState.isSubmitting` true for
  // the whole request. That's what keeps the submit button in its processing state
  // and prevents a second click from firing a duplicate code request.
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
        <Input
          name="phone"
          type="text"
          placeholder="+14155552671"
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
        {/* Submitting the form is the consent event, hence no checkbox. */}
        <DisclosureText data-testid="sms-confirmation-disclosure">
          <FormattedMessage
            {...messages.smsConfirmationDisclosure}
            values={{
              link: (
                <Link
                  target="_blank"
                  to="/pages/$slug"
                  params={{ slug: 'privacy-policy' }}
                >
                  <FormattedMessage
                    {...authProvidersMessages.thePrivacyPolicy}
                  />
                </Link>
              ),
            }}
          />
        </DisclosureText>
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
