import React, { useState } from 'react';

import { Box, Success, Text } from '@citizenlab/cl2-component-library';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import { requestEmailConfirmationCodeChangeEmail } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import { updateEmailUnconfirmed } from 'api/authentication/updateEmailUnconfirmed';
import meKeys from 'api/me/keys';
import { IUser } from 'api/users/types';

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
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

import { FormValues } from '.';

type UpdateEmailFormProps = {
  updateSuccessful: boolean;
  setUpdateSuccessful: (updateSuccessful: boolean) => void;
  setOpenConfirmationModal: (openConfirmationModal: boolean) => void;
  methods: UseFormReturn<FormValues, any>;
  user: IUser;
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
  const currentEmail = user.data.attributes.email;

  const onFormSubmit = async (formValues: FormValues) => {
    setError(undefined);
    try {
      // If confirmation required, launch modal
      if (userConfirmationEnabled) {
        try {
          await requestEmailConfirmationCodeChangeEmail(formValues.email);
          setOpenConfirmationModal(true);
          setError(undefined);
        } catch {
          setError('taken');
        }
      } else {
        // Otherwise, update the user's email
        await updateEmailUnconfirmed(formValues.email);
        await queryClient.invalidateQueries({ queryKey: meKeys.all() });
        setUpdateSuccessful(true);
        methods.reset({ email: '' });
      }
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <>
      <FormProvider {...methods}>
        <Title>
          {user.data.attributes.no_password
            ? formatMessage(messages.titleAddEmail)
            : formatMessage(messages.titleChangeEmail)}
        </Title>
        <Form onSubmit={methods.handleSubmit(onFormSubmit)}>
          {isAdmin(user) && (
            <Warning mt="-20px" mb="20px">
              {formatMessage(messages.adminEmailChangeWarning)}
            </Warning>
          )}
          <Text mt="-20px" mb="20px" color="textSecondary">
            {currentEmail
              ? formatMessage(messages.currentEmail, {
                  email: currentEmail,
                })
              : formatMessage(messages.noEmail)}
          </Text>
          <LabelContainer>
            <FormLabel
              width="max-content"
              margin-right="5px"
              labelMessage={messages.newEmailLabel}
              htmlFor="new_password"
            />
          </LabelContainer>
          <Input name="email" type="text" />
          {error === 'taken' && (
            <Error marginTop="4px" text={formatMessage(messages.emailTaken)} />
          )}
          <StyledButton
            type="submit"
            size="m"
            processing={methods.formState.isSubmitting}
            disabled={methods.formState.isSubmitting}
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
