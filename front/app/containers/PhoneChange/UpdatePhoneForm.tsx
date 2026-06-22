import React, { useState } from 'react';

import { Box, Success } from '@citizenlab/cl2-component-library';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import { requestPhoneConfirmationCodeChangePhone } from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import { IUser } from 'api/users/types';

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
  const currentPhone = user.data.attributes.phone_number;

  const onFormSubmit = (formValues: FormValues) => {
    try {
      requestPhoneConfirmationCodeChangePhone(formValues.phone_number)
        .then(() => {
          setOpenConfirmationModal(true);
          setError(undefined);
        })
        .catch((e) => {
          const errorCode = e?.errors?.phone_number?.[0]?.error;
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
            htmlFor="phone_number"
          />
        </LabelContainer>
        <Input
          name="phone_number"
          type="text"
          placeholder="+14155552671"
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
