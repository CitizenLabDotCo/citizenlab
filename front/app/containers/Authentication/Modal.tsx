import React, { useEffect } from 'react';

import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IFollowingAction } from 'api/authentication/authentication_requirements/types';
import { IInitiativeAction } from 'api/initiative_action_descriptors/types';
import { IPhasePermissionAction } from 'api/permissions/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import T from 'components/T';
import Error from 'components/UI/Error';
import errorMessages from 'components/UI/Error/messages';
import Modal from 'components/UI/Modal';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { MessageDescriptor, useIntl, FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import AuthProviders from './steps/AuthProviders';
import BuiltInFields from './steps/BuiltInFields';
import ChangeEmail from './steps/ChangeEmail';
import CustomFields from './steps/CustomFields';
import EmailAndPassword from './steps/EmailAndPassword';
import EmailAndPasswordSignUp from './steps/EmailAndPasswordSignUp';
import EmailConfirmation from './steps/EmailConfirmation';
import EmaillessSsoEmail from './steps/EmaillessSsoEmail';
import Invitation from './steps/Invitation';
import LightFlowStart from './steps/LightFlowStart';
import Onboarding from './steps/Onboarding';
import Password from './steps/Password';
import AzureAdB2cPolicies from './steps/Policies/AzureAdB2cPolicies';
import AzureAdPolicies from './steps/Policies/AzureAdPolicies';
import EmailPolicies from './steps/Policies/EmailPolicies';
import FacebookPolicies from './steps/Policies/FacebookPolicies';
import FranceConnectLogin from './steps/Policies/FranceConnectLogin';
import GooglePolicies from './steps/Policies/GooglePolicies';
import Success from './steps/Success';
import Verification from './steps/Verification';
import VerificationSuccess from './steps/VerificationSuccess';
import { ModalProps, ErrorCode } from './typings';
import useSteps from './useSteps';

type Step = ReturnType<typeof useSteps>['currentStep'];

const HEADER_MESSAGES: Record<Step, MessageDescriptor | null> = {
  // shared
  closed: null,
  success: null,

  // old sign in flow
  'sign-in:auth-providers': messages.logIn,
  'sign-in:email-password': messages.logIn,

  // old sign up flow
  'sign-up:auth-providers': messages.signUp,
  'sign-up:email-password': messages.signUp,
  'sign-up:email-confirmation': messages.signUp,
  'sign-up:change-email': messages.signUp,
  'sign-up:verification': messages.verifyYourIdentity,
  'sign-up:custom-fields': messages.completeYourProfile,
  'sign-up:onboarding': messages.whatAreYouInterestedIn,
  'sign-up:invite': messages.signUp,
  'emailless-sso:email': messages.signUp,
  'emailless-sso:email-confirmation': messages.confirmYourEmail,

  // light flow
  'light-flow:email': messages.beforeYouParticipate,
  'light-flow:email-policies': messages.beforeYouParticipate,
  'light-flow:google-policies': messages.beforeYouParticipate,
  'light-flow:facebook-policies': messages.beforeYouParticipate,
  'light-flow:azure-ad-policies': messages.beforeYouParticipate,
  'light-flow:azure-ad-b2c-policies': messages.beforeYouParticipate,
  'light-flow:france-connect-login': messages.beforeYouParticipate,
  'light-flow:email-confirmation': messages.confirmYourEmail,
  'light-flow:password': messages.logIn,

  // missing data flow
  'missing-data:built-in': messages.completeYourProfile,
  'missing-data:email-confirmation': messages.confirmYourEmail,
  'missing-data:change-email': messages.confirmYourEmail,
  'missing-data:verification': messages.verifyYourIdentity,
  'missing-data:custom-fields': messages.completeYourProfile,
  'missing-data:onboarding': messages.whatAreYouInterestedIn,

  // verification only
  'verification-only': messages.verifyYourIdentity,
  'verification-success': null,
};

const getHeaderMessage = (
  step: Step,
  action:
    | 'visiting'
    | IInitiativeAction
    | IPhasePermissionAction
    | IFollowingAction
) => {
  if (
    action === 'following' &&
    [
      'light-flow:email',
      'light-flow:email-policies',
      'light-flow:google-policies',
      'light-flow:facebook-policies',
      'light-flow:azure-ad-policies',
      'light-flow:azure-ad-b2c-policies',
      'light-flow:france-connect-login',
    ].includes(step)
  ) {
    return messages.beforeYouFollow;
  }
  return HEADER_MESSAGES[step];
};

export const ERROR_CODE_MESSAGES: Record<ErrorCode, MessageDescriptor> = {
  account_creation_failed: messages.unknownError,
  wrong_confirmation_code: errorMessages.confirmation_code_invalid,
  sign_in_failed: messages.signInError,
  requirements_fetching_failed: messages.unknownError,
  unknown: messages.unknownError,
  invitation_error: messages.invitationErrorText,
  franceconnect_merging_failed: messages.franceConnectMergingFailed,
  email_taken_and_user_can_be_verified: messages.emailTakenAndUserCanBeVerified,
  not_entitled_under_minimum_age:
    messages.nemlogInUnderMinimumAgeVerificationFailed,
  resending_code_failed: errorMessages.resending_code_failed,
};

type HelperTextKey = 'signup_helper_text' | 'custom_fields_signup_helper_text';

const HELPER_TEXT_KEYS: Partial<Record<Step, HelperTextKey>> = {
  'sign-up:auth-providers': 'signup_helper_text',
  'sign-up:email-password': 'signup_helper_text',
  'sign-up:custom-fields': 'custom_fields_signup_helper_text',
  'missing-data:custom-fields': 'custom_fields_signup_helper_text',
};

const AuthModal = ({ setModalOpen }: ModalProps) => {
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

  useEffect(() => {
    setModalOpen?.(currentStep !== 'closed');
  }, [currentStep, setModalOpen]);

  const smallerThanPhone = useBreakpoint('phone');
  const { formatMessage } = useIntl();
  const _fullscreenModalEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });
  const fullscreenModalEnabled = _fullscreenModalEnabled && false;

  const closable =
    currentStep !== 'closed' &&
    currentStep !== 'success' &&
    currentStep !== 'emailless-sso:email';

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
      fullScreen={fullscreenModalEnabled}
      zIndex={fullscreenModalEnabled ? 400 : 10000001}
      width="580px"
      opened={currentStep !== 'closed'}
      close={handleClose}
      hideCloseButton={!closable}
      closeOnClickOutside={false}
      header={
        headerMessage ? (
          <>
            {fullscreenModalEnabled ? (
              <Box w="100%" display="flex" justifyContent="center">
                <Box w="580px" px={marginX}>
                  <Title styleVariant="h3" as="h1" mt="0px" mb="0px">
                    {formatMessage(headerMessage)}
                  </Title>
                </Box>
              </Box>
            ) : (
              <Title styleVariant="h3" as="h1" mt="0px" mb="0px" ml={marginX}>
                {formatMessage(headerMessage)}
              </Title>
            )}
          </>
        ) : undefined
      }
      niceHeader
    >
      <Box
        id="e2e-authentication-modal"
        px={marginX}
        py="32px"
        w={fullscreenModalEnabled ? '580px' : '100%'}
      >
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
        {currentStep === 'emailless-sso:email' && (
          <EmaillessSsoEmail
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT_EMAIL')}
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
        {currentStep === 'light-flow:google-policies' && (
          <GooglePolicies
            loading={loading}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}
        {currentStep === 'light-flow:facebook-policies' && (
          <FacebookPolicies
            loading={loading}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}
        {currentStep === 'light-flow:azure-ad-policies' && (
          <AzureAdPolicies
            loading={loading}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}
        {currentStep === 'light-flow:azure-ad-b2c-policies' && (
          <AzureAdB2cPolicies
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
        {(currentStep === 'sign-up:email-confirmation' ||
          currentStep === 'light-flow:email-confirmation' ||
          currentStep === 'missing-data:email-confirmation' ||
          currentStep === 'emailless-sso:email-confirmation') && (
          <EmailConfirmation
            state={state}
            loading={loading}
            setError={setError}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
            onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          />
        )}

        {(currentStep === 'sign-up:change-email' ||
          currentStep === 'missing-data:change-email') && (
          <ChangeEmail
            loading={loading}
            setError={setError}
            onGoBack={transition(currentStep, 'GO_BACK')}
            onChangeEmail={transition(currentStep, 'RESEND_CODE')}
          />
        )}

        {(currentStep === 'missing-data:verification' ||
          currentStep === 'verification-only' ||
          currentStep === 'sign-up:verification') && (
          <Verification
            setError={setError}
            onCompleted={transition(currentStep, 'CONTINUE')}
            authenticationData={authenticationData}
          />
        )}
        {(currentStep === 'missing-data:custom-fields' ||
          currentStep === 'sign-up:custom-fields') && (
          <CustomFields
            authenticationData={authenticationData}
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT')}
            onSkip={transition(currentStep, 'SKIP')}
          />
        )}

        {(currentStep === 'sign-up:onboarding' ||
          currentStep === 'missing-data:onboarding') && (
          <Onboarding
            authenticationData={authenticationData}
            onSubmit={transition(currentStep, 'SUBMIT')}
            onSkip={transition(currentStep, 'SKIP')}
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
