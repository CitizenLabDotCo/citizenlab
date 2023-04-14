import React, { useEffect, useState } from 'react';

// intl
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// services & hooks
import useAuthUser from 'hooks/useAuthUser';
import { useIntl } from 'utils/cl-intl';
import resendEmailConfirmationCode from 'api/authentication/resendEmailConfirmationCode';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { updateUser } from 'services/users';

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
import { FormProvider, useForm } from 'react-hook-form';
import { FormValues } from '.';
import { object, string } from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import Input from 'components/HookForm/Input';

type UpdateEmailFormProps = {
  updateSuccessful: boolean;
  setNewEmail: (email: string) => void;
  setUpdateSuccessful: (updateSuccessful: boolean) => void;
  setOpenConfirmationModal: (openConfirmationModal: boolean) => void;
};

const UpdateEmailForm = ({
  updateSuccessful,
  setNewEmail,
  setOpenConfirmationModal,
  setUpdateSuccessful,
}: UpdateEmailFormProps) => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();
  const appConfiguration = useAppConfiguration();
  const [error, setError] = useState<'taken' | undefined>(undefined);

  const schema = object({
    email: string()
      .email(formatMessage(messages.emailInvalidError))
      .required(formatMessage(messages.emailEmptyError)),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
    },
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!isNilOrError(authUser) && authUser.attributes.email) {
      methods.setValue('email', authUser.attributes.email);
    }
  }, [authUser, methods]);

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      // If confirmation required, launch modal
      if (appConfiguration.data?.data.attributes.settings.user_confirmation) {
        resendEmailConfirmationCode(formValues.email)
          .then(() => {
            setNewEmail(formValues.email);
            setOpenConfirmationModal(true);
            setError(undefined);
          })
          .catch(() => {
            setError('taken');
          });
      } else {
        // Otherwise, update the user's email
        if (!isNilOrError(authUser)) {
          await updateUser(authUser.id, { ...formValues });
        }
        setUpdateSuccessful(true);
      }
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  if (isNilOrError(authUser)) {
    return null;
  }

  return (
    <>
      <FormProvider {...methods}>
        <Title>
          {authUser.attributes.no_password
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
