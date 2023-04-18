import React from 'react';

// hooks
import useSteps from './useSteps';
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import AuthProviders from './steps/AuthProviders';
import EmailAndPasswordSignUp from './steps/EmailAndPasswordSignUp';
import EmailAndPassword from './steps/EmailAndPassword';
import EmailConfirmation from './steps/EmailConfirmation';
import Verification from './steps/Verification';
import CustomFields from './steps/CustomFields';
import ChangeEmail from './steps/ChangeEmail';
import LightFlowStart from './steps/LightFlowStart';
import EmailPolicies from './steps/Policies/EmailPolicies';
import GooglePolicies from './steps/Policies/GooglePolicies';
import FacebookPolicies from './steps/Policies/FacebookPolicies';
import AzureAdPolicies from './steps/Policies/AzureAdPolicies';
import FranceConnectLogin from './steps/Policies/FranceConnectLogin';
import BuiltInFields from './steps/BuiltInFields';
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
import VerificationSuccess from './steps/VerificationSuccess';

type Step = ReturnType<typeof useSteps>['currentStep'];

const HEADER_MESSAGES: Record<Step, MessageDescriptor | null> = {
  // shared
  closed: null,
  success: null,

  // old sign in flow
  'sign-in:auth-providers': messages.logIn,
  'sign-in:email-password': messages.logIn,
  'sign-in:email-confirmation': messages.logIn,
  'sign-in:change-email': messages.logIn,
  'sign-in:verification': messages.verifyYourIdentity,
  'sign-in:custom-fields': messages.logIn,

  // old sign up flow
  'sign-up:auth-providers': messages.signUp,
  'sign-up:email-password': messages.signUp,
  'sign-up:email-confirmation': messages.signUp,
  'sign-up:change-email': messages.signUp,
  'sign-up:verification': messages.verifyYourIdentity,
  'sign-up:custom-fields': messages.signUp,

  // light flow
  'light-flow:email': messages.beforeYouParticipate,
  'light-flow:email-policies': messages.beforeYouParticipate,
  'light-flow:google-policies': messages.beforeYouParticipate,
  'light-flow:facebook-policies': messages.beforeYouParticipate,
  'light-flow:azure-ad-policies': messages.beforeYouParticipate,
  'light-flow:france-connect-login': messages.beforeYouParticipate,
  'light-flow:email-confirmation': messages.confirmYourEmail,
  'light-flow:password': messages.logIn,

  // missing data flow
  'missing-data:built-in': messages.completeYourProfile,
  'missing-data:email-confirmation': messages.confirmYourEmail,
  'missing-data:change-email': messages.confirmYourEmail,
  'missing-data:verification': messages.verifyYourIdentity,
  'missing-data:custom-fields': messages.completeYourProfile,

  // verification only
  'verification-only': messages.verifyYourIdentity,
  'verification-success': null,
};

const ERROR_CODE_MESSAGES: Record<ErrorCode, MessageDescriptor> = {
  account_creation_failed: oldSignUpMessages.unknownError,
  wrong_confirmation_code: errorMessages.confirmation_code_invalid,
  wrong_password: oldSignInMessages.signInError,
  requirements_fetching_failed: oldSignUpMessages.unknownError,
  unknown: oldSignUpMessages.unknownError,
  invitation_error: messages.invitationError,
};

const AuthModal = () => {
  const {
    currentStep,
    state,
    status,
    error,
    authenticationData,
    transition,
    setError,
  } = useSteps();

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
              <Box w="100%" display="flex" justifyContent="center">
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

        {currentStep === 'success' && (
          <Success
            status={status}
            onContinue={transition(currentStep, 'CONTINUE')}
          />
        )}

        {/* old sign in flow */}
        {currentStep === 'sign-in:auth-providers' && (
          <AuthProviders
            flow="signin"
            onSwitchFlow={transition(currentStep, 'SWITCH_FLOW')}
            onSelectAuthProvider={transition(
              currentStep,
              'SELECT_AUTH_PROVIDER'
            )}
          />
        )}

        {currentStep === 'sign-in:email-password' && (
          <EmailAndPassword
            status={status}
            onSwitchFlow={transition(currentStep, 'SWITCH_FLOW')}
            onGoBack={transition(currentStep, 'GO_BACK')}
            onSubmit={transition(currentStep, 'SIGN_IN')}
          />
        )}

        {currentStep === 'sign-in:email-confirmation' && (
          <EmailConfirmation
            state={state}
            status={status}
            error={error}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
            onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          />
        )}

        {currentStep === 'sign-in:change-email' && (
          <ChangeEmail
            status={status}
            onGoBack={transition(currentStep, 'GO_BACK')}
            onChangeEmail={transition(currentStep, 'RESEND_CODE')}
          />
        )}

        {currentStep === 'sign-in:verification' && (
          <Verification
            authenticationData={authenticationData}
            onCompleted={transition(currentStep, 'CONTINUE')}
            onError={() => setError('unknown')}
          />
        )}

        {currentStep === 'sign-in:custom-fields' && (
          <CustomFields
            status={status}
            onSubmit={transition(currentStep, 'SUBMIT')}
            onSkip={transition(currentStep, 'SKIP')}
          />
        )}

        {/* old sign up flow */}
        {currentStep === 'sign-up:auth-providers' && (
          <AuthProviders
            flow="signup"
            onSwitchFlow={transition(currentStep, 'SWITCH_FLOW')}
            onSelectAuthProvider={transition(
              currentStep,
              'SELECT_AUTH_PROVIDER'
            )}
          />
        )}

        {currentStep === 'sign-up:email-password' && (
          <EmailAndPasswordSignUp
            state={state}
            status={status}
            onError={setError}
            onSwitchFlow={transition(currentStep, 'SWITCH_FLOW')}
            onGoBack={transition(currentStep, 'GO_BACK')}
            onSubmit={transition(currentStep, 'SUBMIT')}
          />
        )}

        {currentStep === 'sign-up:email-confirmation' && (
          <EmailConfirmation
            state={state}
            status={status}
            error={error}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
            onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          />
        )}

        {currentStep === 'sign-up:change-email' && (
          <ChangeEmail
            status={status}
            onGoBack={transition(currentStep, 'GO_BACK')}
            onChangeEmail={transition(currentStep, 'RESEND_CODE')}
          />
        )}

        {currentStep === 'sign-up:verification' && (
          <Verification
            authenticationData={authenticationData}
            onCompleted={transition(currentStep, 'CONTINUE')}
            onError={() => setError('unknown')}
          />
        )}

        {currentStep === 'sign-up:custom-fields' && (
          <CustomFields
            status={status}
            onSubmit={transition(currentStep, 'SUBMIT')}
            onSkip={transition(currentStep, 'SKIP')}
          />
        )}

        {/* light flow */}
        {currentStep === 'light-flow:email' && (
          <LightFlowStart
            onSubmit={transition(currentStep, 'SUBMIT_EMAIL')}
            onSwitchToSSO={transition(currentStep, 'CONTINUE_WITH_SSO')}
          />
        )}

        {currentStep === 'light-flow:email-policies' && (
          <EmailPolicies
            state={state}
            status={status}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}

        {currentStep === 'light-flow:google-policies' && (
          <GooglePolicies
            status={status}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}

        {currentStep === 'light-flow:facebook-policies' && (
          <FacebookPolicies
            status={status}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}

        {currentStep === 'light-flow:azure-ad-policies' && (
          <AzureAdPolicies
            status={status}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}

        {currentStep === 'light-flow:france-connect-login' && (
          <FranceConnectLogin onLogin={transition(currentStep, 'LOGIN')} />
        )}

        {currentStep === 'light-flow:email-confirmation' && (
          <EmailConfirmation
            state={state}
            status={status}
            error={error}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
            onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          />
        )}

        {currentStep === 'light-flow:password' && (
          <Password
            state={state}
            status={status}
            onSubmit={transition(currentStep, 'SUBMIT_PASSWORD')}
          />
        )}

        {/* missing data flow */}
        {currentStep === 'missing-data:built-in' && (
          <BuiltInFields
            status={status}
            onSubmit={transition(currentStep, 'SUBMIT')}
          />
        )}

        {currentStep === 'missing-data:email-confirmation' && (
          <EmailConfirmation
            state={state}
            status={status}
            error={error}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
            onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          />
        )}

        {currentStep === 'missing-data:change-email' && (
          <ChangeEmail
            status={status}
            onGoBack={transition(currentStep, 'GO_BACK')}
            onChangeEmail={transition(currentStep, 'RESEND_CODE')}
          />
        )}

        {currentStep === 'missing-data:verification' && (
          <Verification
            authenticationData={authenticationData}
            onCompleted={transition(currentStep, 'CONTINUE')}
            onError={() => setError('unknown')}
          />
        )}

        {currentStep === 'missing-data:custom-fields' && (
          <CustomFields
            status={status}
            onSubmit={transition(currentStep, 'SUBMIT')}
            onSkip={transition(currentStep, 'SKIP')}
          />
        )}

        {/* verification only */}
        {currentStep === 'verification-only' && (
          <Verification
            authenticationData={authenticationData}
            onCompleted={transition(currentStep, 'CONTINUE')}
            onError={() => setError('unknown')}
          />
        )}

        {currentStep === 'verification-success' && (
          <VerificationSuccess onClose={transition(currentStep, 'CLOSE')} />
        )}
      </Box>
    </Modal>
  );
};

export default AuthModal;
