import React, { useState } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { Helmet } from 'react-helmet';
import { StyledContentContainer } from 'components/smallForm';
import GoBackButton from 'components/UI/GoBackButton';
import EmailConfirmation from 'containers/NewAuthModal/steps/EmailConfirmation';
import Modal from 'components/UI/Modal';
import Error from 'components/UI/Error';
import CancelUpdate from './CancelUpdate';
import UpdateEmailForm from './UpdateEmailForm';

// api
import clHistory from 'utils/cl-router/history';
import useAuthUser from 'hooks/useAuthUser';
import confirmEmail from 'api/authentication/confirmEmail';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { Status, ErrorCode } from 'containers/NewAuthModal/typings';
import { ERROR_CODE_MESSAGES } from 'containers/NewAuthModal';

export type FormValues = {
  email: string;
};

const EmailChange = () => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [newEmail, setNewEmail] = useState<string | null>(null);
  const [confirmationStatus, setConfirmationStatus] = useState<Status>('ok');
  const [confirmationError, setConfirmationError] = useState<ErrorCode | null>(
    null
  );
  const [updateSuccessful, setUpdateSuccessful] = useState(false);
  const [updateCancelled, setUpdateCancelled] = useState(false);

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
        {updateCancelled && <CancelUpdate />}
        {!updateCancelled && (
          <UpdateEmailForm
            updateSuccessful={updateSuccessful}
            setNewEmail={setNewEmail}
            setOpenConfirmationModal={setOpenConfirmationModal}
            setUpdateSuccessful={setUpdateSuccessful}
          />
        )}
      </StyledContentContainer>
      <Modal
        fullScreen={false}
        width="580px"
        opened={openConfirmationModal}
        close={() => {
          setOpenConfirmationModal(false);
          setUpdateCancelled(true);
        }}
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
