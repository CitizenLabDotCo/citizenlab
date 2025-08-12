import React, { lazy, Suspense } from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import T from 'components/T';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { useIntl, FormattedMessage } from 'utils/cl-intl';

import {
  getHeaderMessage,
  HELPER_TEXT_KEYS,
  ERROR_CODE_MESSAGES,
} from './messageUtils';
import AccessDenied from './steps/AccessDenied';
import AuthProviders from './steps/AuthProviders';
import BuiltInFields from './steps/BuiltInFields';
import ChangeEmail from './steps/ChangeEmail';
import EmailAndPassword from './steps/EmailAndPassword';
import EmailAndPasswordSignUp from './steps/EmailAndPasswordSignUp';
import EmailAndPasswordVerifiedActions from './steps/EmailAndPasswordVerifiedActions';
import EmailConfirmation from './steps/EmailConfirmation';
import Invitation from './steps/Invitation';
import LightFlowStart from './steps/LightFlowStart';
import Onboarding from './steps/Onboarding';
import Password from './steps/Password';
import EmailPolicies from './steps/Policies/EmailPolicies';
import FranceConnectLogin from './steps/Policies/FranceConnectLogin';
import SSOPolicies from './steps/Policies/SSOPolicies';
import SSOVerification from './steps/SSOVerification';
import SSOVerificationPolicies from './steps/SSOVerificationPolicies';
import Success from './steps/Success';
import Verification from './steps/Verification';
import VerificationSuccess from './steps/VerificationSuccess';
import useSteps from './useSteps';
// All steps above could be lazy loaded
// but this one was the worst in terms of bundle size impact
const CustomFields = lazy(() => import('./steps/CustomFields'));

const AuthModal = () => {
  const {
    currentStep,
    state,
    loading,
    error,
    authenticationData,
    transition,
    setError,
  } = useSteps();

  const { data: appConfiguration } = useAppConfiguration();
  const theme = useTheme();

  const smallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();

  const closable = currentStep !== 'closed' && currentStep !== 'success';

  const {
    context: { action },
  } = authenticationData;
  const headerMessage = getHeaderMessage(currentStep, action);

  const handleClose = () => {
    if (!closable) return;
    transition(currentStep, 'CLOSE')();
  };

  const marginX = smallerThanPhone ? '16px' : '32px';

  const helperTextKey = HELPER_TEXT_KEYS[currentStep];
  const helperText = helperTextKey
    ? appConfiguration?.data.attributes.settings.core[helperTextKey]
    : undefined;

  return (
    <Modal
      zIndex={10000001}
      width="580px"
      opened={currentStep !== 'closed'}
      close={handleClose}
      hideCloseButton={!closable}
      closeOnClickOutside={false}
      header={
        headerMessage ? (
          <Title variant="h3" as="h1" mt="0px" mb="0px" ml={marginX}>
            {formatMessage(headerMessage)}
          </Title>
        ) : undefined
      }
      niceHeader
    >
      <Box id="e2e-authentication-modal" px={marginX} py="32px" w="100%">
        {error && (
          <Box mb="16px">
            <Error
              text={
                <FormattedMessage
                  {...ERROR_CODE_MESSAGES[error]}
                  values={{ br: <br /> }}
                />
              }
            />
          </Box>
        )}
        {helperText && (
          <Box mb="16px">
            <QuillEditedContent
              textColor={theme.colors.tenantText}
              fontSize="base"
              fontWeight={300}
            >
              <T value={helperText} supportHtml />
            </QuillEditedContent>
          </Box>
        )}
        {currentStep === 'success' && (
          <Success
            loading={loading}
            onContinue={transition(currentStep, 'CONTINUE')}
          />
        )}
        {/* old sign in flow */}
        {currentStep === 'sign-in:auth-providers' && (
          <AuthProviders
            flow="signin"
            error={error}
            onSwitchFlow={transition(currentStep, 'SWITCH_FLOW')}
            onSelectAuthProvider={transition(
              currentStep,
              'SELECT_AUTH_PROVIDER'
            )}
          />
        )}
        {currentStep === 'sign-in:email-password' && (
          <EmailAndPassword
            loading={loading}
            setError={setError}
            onSwitchFlow={transition(currentStep, 'SWITCH_FLOW')}
            onGoBack={transition(currentStep, 'GO_BACK')}
            onSubmit={transition(currentStep, 'SIGN_IN')}
            closeModal={transition(currentStep, 'CLOSE')}
          />
        )}
        {/* old sign up flow */}
        {currentStep === 'sign-up:auth-providers' && (
          <AuthProviders
            flow="signup"
            error={error}
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
            loading={loading}
            setError={setError}
            onSwitchFlow={transition(currentStep, 'SWITCH_FLOW')}
            onGoBack={transition(currentStep, 'GO_BACK')}
            onSubmit={transition(currentStep, 'SUBMIT')}
          />
        )}
        {currentStep === 'sign-up:invite' && (
          <Invitation
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT')}
          />
        )}
        {/* light flow */}
        {currentStep === 'light-flow:email' && (
          <LightFlowStart
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT_EMAIL')}
            onSwitchToSSO={transition(currentStep, 'CONTINUE_WITH_SSO')}
          />
        )}
        {currentStep === 'light-flow:email-policies' && (
          <EmailPolicies
            state={state}
            loading={loading}
            setError={setError}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}
        {currentStep === 'light-flow:sso-policies' && (
          <SSOPolicies
            state={state}
            loading={loading}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}
        {currentStep === 'light-flow:france-connect-login' && (
          <FranceConnectLogin onLogin={transition(currentStep, 'LOGIN')} />
        )}
        {currentStep === 'light-flow:password' && (
          <Password
            state={state}
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT_PASSWORD')}
          />
        )}

        {/* missing data flow / shared */}
        {currentStep === 'missing-data:built-in' && (
          <BuiltInFields
            loading={loading}
            authenticationData={authenticationData}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT')}
          />
        )}
        {(currentStep === 'light-flow:email-confirmation' ||
          currentStep === 'missing-data:email-confirmation') && (
          <EmailConfirmation
            state={state}
            loading={loading}
            setError={setError}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
            onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          />
        )}

        {currentStep === 'missing-data:change-email' && (
          <ChangeEmail
            loading={loading}
            setError={setError}
            onGoBack={transition(currentStep, 'GO_BACK')}
            onChangeEmail={transition(currentStep, 'RESEND_CODE')}
          />
        )}

        {(currentStep === 'missing-data:verification' ||
          currentStep === 'verification-only') && (
          <Verification
            setError={setError}
            onCompleted={transition(currentStep, 'CONTINUE')}
            authenticationData={authenticationData}
          />
        )}
        {currentStep === 'missing-data:custom-fields' && (
          <Suspense fallback={null}>
            <CustomFields
              authenticationData={authenticationData}
              loading={loading}
              setError={setError}
              onSubmit={transition(currentStep, 'SUBMIT')}
              onSkip={transition(currentStep, 'SKIP')}
            />
          </Suspense>
        )}

        {currentStep === 'missing-data:onboarding' && (
          <Onboarding
            authenticationData={authenticationData}
            onSubmit={transition(currentStep, 'SUBMIT')}
            onSkip={transition(currentStep, 'SKIP')}
          />
        )}

        {currentStep === 'verification-success' && (
          <VerificationSuccess onClose={transition(currentStep, 'CLOSE')} />
        )}

        {/* sso verification flow */}
        {currentStep === 'sso-verification:sso-providers' && (
          <SSOVerification
            onClickSSO={transition(currentStep, 'CONTINUE_WITH_SSO')}
            onClickLogin={transition(currentStep, 'GO_TO_LOGIN')}
          />
        )}

        {currentStep === 'sso-verification:sso-providers-policies' && (
          <SSOVerificationPolicies
            state={state}
            loading={loading}
            onAccept={transition(currentStep, 'ACCEPT')}
          />
        )}

        {currentStep === 'sso-verification:email-password' && (
          <EmailAndPasswordVerifiedActions
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SIGN_IN')}
            onSwitchFlow={transition(currentStep, 'SWITCH_FLOW')}
            closeModal={transition(currentStep, 'CLOSE')}
          />
        )}

        {currentStep === 'access-denied' && (
          <AccessDenied
            authenticationData={authenticationData}
            onClose={transition(currentStep, 'CLOSE')}
          />
        )}
      </Box>
    </Modal>
  );
};

export default AuthModal;
