import React from 'react';

// hooks
import useSteps from './useSteps';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import EmailSignUp from './steps/EmailSignUp';
import EmailConfirmation from './steps/EmailConfirmation';
import Password from './steps/Password';
import Success from './steps/Success';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props extends ReturnType<typeof useSteps> {}

const AuthModal = ({ /* currentStep, */ status, error, transition }: Props) => {
  const currentStep = 'password' as Props['currentStep'];
  const { formatMessage } = useIntl();

  const closable =
    currentStep === 'email-registration' ||
    currentStep === 'email-confirmation' ||
    currentStep === 'enter-password';

  const showHeader = currentStep !== 'success';

  const handleClose = () => {
    if (!closable) return;
    transition(currentStep, 'CLOSE')();
  };

  return (
    <Modal
      width="580px"
      opened={currentStep !== 'closed'}
      close={handleClose}
      hideCloseButton={!closable}
      header={
        showHeader ? (
          <Title variant="h3" as="h1" mt="0px" mb="0px">
            {formatMessage(messages.beforeYouParticipate)}
          </Title>
        ) : undefined
      }
      niceHeader
    >
      <Box p="32px" w="100%">
        {currentStep === 'email-registration' && (
          <EmailSignUp
            status={status}
            error={error}
            onSubmit={transition(currentStep, 'SUBMIT_EMAIL')}
            onSwitchToSSO={transition(currentStep, 'CONTINUE_WITH_SSO')}
          />
        )}

        {currentStep === 'email-confirmation' && (
          <EmailConfirmation
            status={status}
            error={error}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
            onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          />
        )}

        {currentStep === 'enter-password' && <Password />}

        {currentStep === 'success' && <Success />}
      </Box>
    </Modal>
  );
};

export default AuthModal;
