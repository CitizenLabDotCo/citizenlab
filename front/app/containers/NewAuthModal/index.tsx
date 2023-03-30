import React from 'react';

// hooks
import useSteps from './useSteps';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import LightFlowStart from './steps/LightFlowStart';
import EmailPolicies from './steps/Policies/EmailPolicies';
import GooglePolicies from './steps/Policies/GooglePolicies';
import FacebookPolicies from './steps/Policies/FacebookPolicies';
import AzureAdPolicies from './steps/Policies/AzureAdPolicies';
import FranceConnectLogin from './steps/Policies/FranceConnectLogin';
import EmailConfirmation from './steps/EmailConfirmation';
import Password from './steps/Password';
import Success from './steps/Success';
import Error from 'components/UI/Error';

// i18n
import { MessageDescriptor, useIntl } from 'utils/cl-intl';
import messages from './messages';
import oldSignUpMessages from 'containers/Authentication/SignUpIn/SignUpInModal/SignUp/messages';
import oldSignInMessages from 'containers/Authentication/SignUpIn/SignUpInModal/SignIn/messages';
import errorMessages from 'components/UI/Error/messages';

// typings
import { ErrorCode } from './typings';

const getHeaderMessage = (step: ReturnType<typeof useSteps>['currentStep']) => {
  if (step === 'light-flow-start') return messages.beforeYouParticipate;
  if (step.endsWith('policies')) return messages.beforeYouParticipate;
  if (step === 'france-connect-login') return messages.beforeYouParticipate;
  if (step === 'email-confirmation') return messages.confirmYourEmail;
  if (step === 'enter-password') return messages.logIn;
  return null;
};

const ERROR_CODE_MESSAGES: Record<ErrorCode, MessageDescriptor> = {
  account_creation_failed: oldSignUpMessages.unknownError,
  wrong_confirmation_code: errorMessages.confirmation_code_invalid,
  wrong_password: oldSignInMessages.signInError,
  requirements_fetching_failed: oldSignUpMessages.unknownError,
  unknown: oldSignUpMessages.unknownError,
};

const AuthModal = () => {
  const { currentStep, transition, error, status, state } = useSteps();
  const smallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const fullscreenModalEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });

  const closable = currentStep !== 'closed' && currentStep !== 'success';

  const headerMessage = getHeaderMessage(currentStep);

  const handleClose = () => {
    if (!closable) return;
    transition(currentStep, 'CLOSE')();
  };

  const marginX = smallerThanPhone ? '16px' : '32px';

  return (
    <Modal
      fullScreen={fullscreenModalEnabled}
      zIndex={fullscreenModalEnabled ? 400 : 10000001}
      width="580px"
      opened={currentStep !== 'closed'}
      close={handleClose}
      hideCloseButton={!closable}
      header={
        headerMessage ? (
          <>
            {fullscreenModalEnabled ? (
              <Box
                w="100%"
                display="flex"
                justifyContent="center"
                className="BLA"
              >
                <Box w="580px" px={marginX}>
                  <Title variant="h3" as="h1" mt="0px" mb="0px">
                    {formatMessage(headerMessage)}
                  </Title>
                </Box>
              </Box>
            ) : (
              <Title variant="h3" as="h1" mt="0px" mb="0px" ml={marginX}>
                {formatMessage(headerMessage)}
              </Title>
            )}
          </>
        ) : undefined
      }
      niceHeader
    >
      <Box px={marginX} py="32px" w={fullscreenModalEnabled ? '580px' : '100%'}>
        {error && (
          <Box mb="16px">
            <Error text={formatMessage(ERROR_CODE_MESSAGES[error])} />
          </Box>
        )}

        {currentStep === 'light-flow-start' && (
          <LightFlowStart
            onSubmit={transition(currentStep, 'SUBMIT_EMAIL')}
            onSwitchToSSO={transition(currentStep, 'CONTINUE_WITH_SSO')}
          />
        )}

        {currentStep === 'email-policies' && (
          <EmailPolicies
            state={state}
            status={status}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}

        {currentStep === 'google-policies' && (
          <GooglePolicies
            status={status}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}

        {currentStep === 'facebook-policies' && (
          <FacebookPolicies
            status={status}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}

        {currentStep === 'azure-ad-policies' && (
          <AzureAdPolicies
            status={status}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}

        {currentStep === 'france-connect-login' && (
          <FranceConnectLogin onLogin={transition(currentStep, 'LOGIN')} />
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
