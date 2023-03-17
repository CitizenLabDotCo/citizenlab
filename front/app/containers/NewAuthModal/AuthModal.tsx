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
import Error from 'components/UI/Error';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props extends ReturnType<typeof useSteps> {}

const getHeaderMessage = (step: Props['currentStep']) => {
  if (step === 'email-registration') return messages.beforeYouParticipate;
  if (step === 'email-confirmation') return messages.confirmYourEmail;
  if (step === 'enter-password') return messages.logIn;
  return null;
};

const AuthModal = ({
  currentStep,
  state,
  status,
  error,
  transition,
}: Props) => {
  const { formatMessage } = useIntl();

  const closable =
    currentStep === 'email-registration' ||
    currentStep === 'email-confirmation' ||
    currentStep === 'enter-password';

  const headerMessage = getHeaderMessage(currentStep);

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
        headerMessage ? (
          <Title variant="h3" as="h1" mt="0px" mb="0px">
            {formatMessage(headerMessage)}
          </Title>
        ) : undefined
      }
      niceHeader
    >
      <Box p="32px" w="100%">
        {error && (
          <Box mb="20px">
            <Error text={error} />
          </Box>
        )}

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
            state={state}
            status={status}
            error={error}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
            onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          />
        )}

        {currentStep === 'enter-password' && (
          <Password
            state={state}
            status={status}
            onSubmit={transition(currentStep, 'SUBMIT_PASSWORD')}
          />
        )}

        {currentStep === 'success' && (
          <Success
            status={status}
            onContinue={transition(currentStep, 'CONTINUE')}
          />
        )}
      </Box>
    </Modal>
  );
};

export default AuthModal;
