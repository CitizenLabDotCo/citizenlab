import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { object, string } from 'yup';

import { confirmCodePhoneChange } from 'api/authentication/confirm_phone/confirmPhoneConfirmationCode';
import { requestCodePhoneChange } from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import meKeys from 'api/me/keys';
import useAuthUser from 'api/me/useAuthUser';

import { ERROR_CODE_MESSAGES } from 'containers/Authentication/messageUtils';
import PhoneConfirmation from 'containers/Authentication/steps/PhoneConfirmation';
import { ErrorCode } from 'containers/Authentication/typings';

import { StyledContentContainer } from 'components/smallForm';
import Error from 'components/UI/Error';
import GoBackButton from 'components/UI/GoBackButton';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { queryClient } from 'utils/cl-react-query/queryClient';
import clHistory from 'utils/cl-router/history';

import CancelUpdate from './CancelUpdate';
import messages from './messages';
import UpdatePhoneForm from './UpdatePhoneForm';

export type FormValues = {
  phone_number: string;
};

const PhoneChange = () => {
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
    phone_number: string().required(formatMessage(messages.phoneEmptyError)),
  });

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      phone_number: '',
    },
    resolver: yupResolver(schema),
  });

  const phoneValue = methods.watch('phone_number');

  const onPhoneConfirmation = async (code: string) => {
    setLoading(true);

    try {
      if (!phoneValue) return;
      await confirmCodePhoneChange(code);
      await queryClient.invalidateQueries(meKeys.all());
      setConfirmationError(null);
      setOpenConfirmationModal(false);
      setUpdateSuccessful(true);
      methods.reset({ phone_number: '' });
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
            <UpdatePhoneForm
              updateSuccessful={updateSuccessful}
              setOpenConfirmationModal={setOpenConfirmationModal}
              methods={methods}
              user={authUser}
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
            <PhoneConfirmation
              phoneNumber={phoneValue}
              loading={loading}
              setError={setConfirmationError}
              onConfirm={onPhoneConfirmation}
              onResendCode={() => requestCodePhoneChange(phoneValue)}
            />
          </Box>
        </Modal>
      </main>
    </>
  );
};

export default PhoneChange;
