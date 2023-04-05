import React from 'react';

// hooks
import useSteps from './useSteps';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import AuthProviders from './steps/AuthProviders';
import EmailAndPassword from './steps/EmailAndPassword';
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

type Step = ReturnType<typeof useSteps>['currentStep'];

const HEADER_MESSAGES: Record<Step, MessageDescriptor | null> = {
  closed: null,
  'auth-providers-sign-in': messages.logIn,
  'email-password-sign-in': messages.logIn,
  'light-flow-start': messages.beforeYouParticipate,
  'email-policies': messages.beforeYouParticipate,
  'google-policies': messages.beforeYouParticipate,
  'facebook-policies': messages.beforeYouParticipate,
  'azure-ad-policies': messages.beforeYouParticipate,
  'france-connect-login': messages.beforeYouParticipate,
  'email-confirmation': messages.confirmYourEmail,
  'enter-password': messages.logIn,
  success: null,
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

  const headerMessage = HEADER_MESSAGES[currentStep];

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

        {/* OLD SIGN IN FLOW */}
        {currentStep === 'auth-providers-sign-in' && (
          <AuthProviders
            flow="signin"
            onSwitchFlow={transition(currentStep, 'SWITCH_FLOW')}
            onSelectAuthProvider={transition(
              currentStep,
              'SELECT_AUTH_PROVIDER'
            )}
          />
        )}

        {currentStep === 'email-password-sign-in' && (
          <EmailAndPassword
            status={status}
            onSwitchFlow={transition(currentStep, 'SWITCH_FLOW')}
            onGoBack={transition(currentStep, 'GO_BACK')}
            onSubmit={transition(currentStep, 'SIGN_IN')}
          />
        )}

        {/* LIGHT FLOW */}
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
