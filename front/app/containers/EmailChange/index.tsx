import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';

import { confirmEmailConfirmationCodeChangeEmail } from 'api/authentication/confirm_email/confirmEmailConfirmationCode';
import { requestEmailConfirmationCodeChangeEmail } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import useAuthUser from 'api/me/useAuthUser';

import { ERROR_CODE_MESSAGES } from 'containers/Authentication/messageUtils';
import EmailConfirmation from 'containers/Authentication/steps/EmailConfirmation';
import { ErrorCode } from 'containers/Authentication/typings';

import { StyledContentContainer } from 'components/smallForm';
import Error from 'components/UI/Error';
import GoBackButton from 'components/UI/GoBackButton';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import CancelUpdate from './CancelUpdate';
import messages from './messages';
import UpdateEmailForm from './UpdateEmailForm';

export type FormValues = {
  email: string;
};

const EmailChange = () => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmationError, setConfirmationError] = useState<ErrorCode | null>(
    null
  );
  const [updateSuccessful, setUpdateSuccessful] = useState(false);
  const [updateCancelled, setUpdateCancelled] = useState(false);

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

  const emailValue = methods.watch('email');

  const onEmailConfirmation = async (_email: string, code: string) => {
    setLoading(true);

    try {
      if (!emailValue) return;
      await confirmEmailConfirmationCodeChangeEmail(code);
      setConfirmationError(null);
      setOpenConfirmationModal(false);
      setUpdateSuccessful(true);
    } catch (e) {
      if (e?.code?.[0]?.error === 'invalid') {
        setConfirmationError('wrong_confirmation_code');
      } else {
        setConfirmationError('unknown');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!authUser) {
    return null;
  }

  const newEmail = methods.watch('email');

  return (
    <>
      <Helmet
        title={formatMessage(messages.helmetTitle)}
        meta={[
          {
            name: 'description',
            content: formatMessage(messages.helmetDescription),
          },
        ]}
      />
      <Box p="32px" pb="0">
        <GoBackButton
          onClick={() => {
            clHistory.goBack();
          }}
        />
      </Box>
      <main>
        <StyledContentContainer>
          {updateCancelled && <CancelUpdate />}
          {!updateCancelled && (
            <UpdateEmailForm
              updateSuccessful={updateSuccessful}
              setOpenConfirmationModal={setOpenConfirmationModal}
              setUpdateSuccessful={setUpdateSuccessful}
              methods={methods}
              user={authUser.data}
            />
          )}
        </StyledContentContainer>
        <Modal
          width="580px"
          opened={openConfirmationModal}
          close={() => {
            setOpenConfirmationModal(false);
            setUpdateCancelled(true);
          }}
          hideCloseButton={false}
          header={formatMessage(messages.confirmationModalTitle)}
        >
          <Box padding="32px">
            {confirmationError && (
              <Box mb="16px">
                <Error
                  text={formatMessage(ERROR_CODE_MESSAGES[confirmationError])}
                />
              </Box>
            )}
            <EmailConfirmation
              state={{
                flow: 'signup',
                email: newEmail,
                token: null,
                prefilledBuiltInFields: null,
                ssoProvider: null,
              }}
              loading={loading}
              setError={setConfirmationError}
              onConfirm={onEmailConfirmation}
              onResendCode={requestEmailConfirmationCodeChangeEmail}
            />
          </Box>
        </Modal>
      </main>
    </>
  );
};

export default EmailChange;
