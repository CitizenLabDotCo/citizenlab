import React, { useState } from 'react';

// intl
import messages from './messages';

// services & hooks
import { TAuthUser } from 'hooks/useAuthUser';
import { useIntl } from 'utils/cl-intl';
import resendEmailConfirmationCode from 'api/authentication/confirm_email/resendEmailConfirmationCode';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

// components
import {
  Title,
  StyledButton,
  Form,
  LabelContainer,
} from 'components/smallForm';
import Error from 'components/UI/Error';
import { FormLabel } from 'components/UI/FormComponents';
import { Box, Success } from '@citizenlab/cl2-component-library';

// hook form
import { FormProvider, UseFormReturn } from 'react-hook-form';
import { FormValues } from '.';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import Input from 'components/HookForm/Input';

// utils
import { isNilOrError } from 'utils/helperUtils';
import useUpdateUser from 'api/users/useUpdateUser';

type UpdateEmailFormProps = {
  updateSuccessful: boolean;
  setUpdateSuccessful: (updateSuccessful: boolean) => void;
  setOpenConfirmationModal: (openConfirmationModal: boolean) => void;
  methods: UseFormReturn<FormValues, any>;
  user: TAuthUser;
};

const UpdateEmailForm = ({
  updateSuccessful,
  setOpenConfirmationModal,
  setUpdateSuccessful,
  methods,
  user,
}: UpdateEmailFormProps) => {
  const { formatMessage } = useIntl();
  const { data: appConfiguration } = useAppConfiguration();
  const { mutateAsync: updateUser } = useUpdateUser();
  const [error, setError] = useState<'taken' | undefined>(undefined);

  if (isNilOrError(user)) {
    return null;
  }

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      // If confirmation required, launch modal
      if (appConfiguration?.data?.attributes.settings.user_confirmation) {
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
