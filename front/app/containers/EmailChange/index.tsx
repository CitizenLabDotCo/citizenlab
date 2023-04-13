import React, { useEffect, useState } from 'react';

// components
import { Box, Success } from '@citizenlab/cl2-component-library';
import { Helmet } from 'react-helmet';
import {
  StyledContentContainer,
  Title,
  StyledButton,
  Form,
  LabelContainer,
} from 'components/smallForm';
import { FormLabel } from 'components/UI/FormComponents';
import GoBackButton from 'components/UI/GoBackButton';
import EmailConfirmation from 'containers/NewAuthModal/steps/EmailConfirmation';
import Modal from 'components/UI/Modal';
import Error from 'components/UI/Error';

// api
import clHistory from 'utils/cl-router/history';
import { updateUser } from 'services/users';
import useAuthUser from 'hooks/useAuthUser';
import confirmEmail from 'api/authentication/confirmEmail';

// hook form
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';
import Input from 'components/HookForm/Input';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import resendEmailConfirmationCode from 'api/authentication/resendEmailConfirmationCode';

// typings
import { Status, ErrorCode } from 'containers/NewAuthModal/typings';
import { ERROR_CODE_MESSAGES } from 'containers/NewAuthModal';

type FormValues = {
  email: string;
};

const EmailChange = () => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();
  const appConfiguration = useAppConfiguration();
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [newEmail, setNewEmail] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<Status>('ok');
  const [confirmationError, setConfirmationError] = useState<ErrorCode | null>(
    null
  );
  const [updateSuccessful, setUpdateSuccessful] = useState(false);

  const schema = object({
    email: string()
      .email(formatMessage(messages.emailInvalidError))
      .required(formatMessage(messages.emailEmptyError)),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      email: !isNilOrError(authUser) ? authUser.attributes.email : '',
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
        resendEmailConfirmationCode(formValues.email);
        setNewEmail(formValues.email);
        setOpenConfirmationModal(true);
      } else {
        if (!isNilOrError(authUser)) {
          await updateUser(authUser.id, { ...formValues });
        }
        setUpdateSuccessful(true);
      }
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const onEmailConfirmation = async (code: string) => {
    try {
      await confirmEmail({ code });
      setConfirmationStatus('ok');
      setConfirmationError(null);
      setOpenConfirmationModal(false);
      setUpdateSuccessful(true);
    } catch (e) {
      setConfirmationStatus('error');
      if (e?.code?.[0]?.error === 'invalid') {
        setConfirmationError('wrong_confirmation_code');
      } else {
        setConfirmationError('unknown');
      }
    }
  };

  if (isNilOrError(authUser)) {
    return null;
  }

  return (
    <Box>
      <FormProvider {...methods}>
        <Helmet
          title={formatMessage(messages.helmetTitle)}
          meta={[
            {
              name: 'description',
              content: formatMessage(messages.helmetDescription),
            },
          ]}
        />
        <StyledContentContainer>
          <Box mt="30px">
            <GoBackButton
              onClick={() => {
                clHistory.goBack();
              }}
            />
          </Box>
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
            <Input name="email" type="text" />
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
        </StyledContentContainer>
      </FormProvider>
      <Modal
        fullScreen={false}
        width="580px"
        opened={openConfirmationModal}
        close={() => setOpenConfirmationModal(false)}
        hideCloseButton={false}
        header={formatMessage(messages.confirmationModalTitle)}
      >
        <Box padding="16px">
          {confirmationError && (
            <Box mb="16px">
              <Error
                text={formatMessage(ERROR_CODE_MESSAGES[confirmationError])}
              />
            </Box>
          )}
          <EmailConfirmation
            state={{ email: newEmail }}
            status={confirmationStatus}
            error={confirmationError}
            onConfirm={onEmailConfirmation}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default EmailChange;
