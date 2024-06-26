import React, { useState } from 'react';

import { Box, Success } from '@citizenlab/cl2-component-library';
import { FormProvider, UseFormReturn } from 'react-hook-form';

import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';
import { IUserData } from 'api/users/types';
import useUpdateUser from 'api/users/useUpdateUser';

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
  const { mutateAsync: updateUser } = useUpdateUser();
  const [error, setError] = useState<'taken' | undefined>(undefined);
  const userConfirmationEnabled = useFeatureFlag({ name: 'user_confirmation' });

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      // If confirmation required, launch modal
      if (userConfirmationEnabled) {
        resendEmailConfirmationCode(formValues.email)
          .then(() => {
            setOpenConfirmationModal(true);
            setError(undefined);
          })
          .catch(() => {
            setError('taken');
          });
      } else {
        // Otherwise, update the user's email
        await updateUser({ userId: user.id, ...formValues });
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
