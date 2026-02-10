import React, { useState } from 'react';

import { Box, Success } from '@citizenlab/cl2-component-library';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import { requestEmailConfirmationCodeChangeEmail } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import { updateEmailUnconfirmed } from 'api/authentication/updateEmailUnconfirmed';
import { IUserData } from 'api/users/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Input from 'components/HookForm/Input';
import {
  Title,
  StyledButton,
  Form,
  LabelContainer,
} from 'components/smallForm';
import Error from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import messages from './messages';

import { FormValues } from '.';

type UpdateEmailFormProps = {
  updateSuccessful: boolean;
  setUpdateSuccessful: (updateSuccessful: boolean) => void;
  setOpenConfirmationModal: (openConfirmationModal: boolean) => void;
  methods: UseFormReturn<FormValues, any>;
  user: IUserData;
};

const UpdateEmailForm = ({
  updateSuccessful,
  setOpenConfirmationModal,
  setUpdateSuccessful,
  methods,
  user,
}: UpdateEmailFormProps) => {
  const { formatMessage } = useIntl();
  const [error, setError] = useState<'taken' | undefined>(undefined);
  const userConfirmationEnabled = useFeatureFlag({ name: 'user_confirmation' });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      // If confirmation required, launch modal
      if (userConfirmationEnabled) {
        requestEmailConfirmationCodeChangeEmail(formValues.email)
          .then(() => {
            setOpenConfirmationModal(true);
            setError(undefined);
          })
          .catch(() => {
            setError('taken');
          });
      } else {
        // Otherwise, update the user's email
        await updateEmailUnconfirmed(formValues.email);
        setUpdateSuccessful(true);
      }
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <>
      <FormProvider {...methods}>
        <Title>
          {user.attributes.no_password
            ? formatMessage(messages.titleAddEmail)
            : formatMessage(messages.titleChangeEmail)}
        </Title>
        <Form>
          <LabelContainer>
            <FormLabel
              width="max-content"
              margin-right="5px"
              labelMessage={messages.newEmailLabel}
              htmlFor="new_password"
            />
          </LabelContainer>
          <Input
            name="email"
            type="text"
            onBlur={() => {
              setError(undefined);
            }}
          />
          {error === 'taken' && (
            <Error marginTop="4px" text={formatMessage(messages.emailTaken)} />
          )}
          <StyledButton
            type="submit"
            size="m"
            processing={methods.formState.isSubmitting}
            onClick={methods.handleSubmit(onFormSubmit)}
            text={formatMessage(messages.submitButton)}
            dataCy="change-email-submit-button"
          />
        </Form>
        <Box display="flex" justifyContent="center">
          {updateSuccessful && (
            <Success text={formatMessage(messages.updateSuccessful)} />
          )}
        </Box>
      </FormProvider>
    </>
  );
};

export default UpdateEmailForm;
