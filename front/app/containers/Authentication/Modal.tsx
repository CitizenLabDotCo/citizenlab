import React, { useEffect } from 'react';

// hooks
import useSteps from './useSteps';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { useTheme } from 'styled-components';

// components
import { Box, Title, useBreakpoint } from '@citizenlab/cl2-component-library';
import Modal from 'components/UI/Modal';
import AuthProviders from './steps/AuthProviders';
import EmailAndPasswordSignUp from './steps/EmailAndPasswordSignUp';
import EmailAndPassword from './steps/EmailAndPassword';
import EmailConfirmation from './steps/EmailConfirmation';
import Verification from './steps/Verification';
import CustomFields from './steps/CustomFields';
import Invitation from './steps/Invitation';
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
import ClaveUnicaEmail from './steps/ClaveUnicaEmail';
import Error from 'components/UI/Error';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// i18n
import { MessageDescriptor, useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import errorMessages from 'components/UI/Error/messages';

// typings
import { ErrorCode } from './typings';
import VerificationSuccess from './steps/VerificationSuccess';
import T from 'components/T';
import { IInitiativeAction } from 'api/initiative_action_descriptors/types';
import { IParticipationContextPermissionAction } from 'services/actionPermissions';
import { IFollowingAction } from 'api/authentication/authentication_requirements/types';

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
  'sign-up:invite': messages.signUp,
  'clave-unica:email': messages.signUp,
  'clave-unica:email-confirmation': messages.confirmYourEmail,

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

const getHeaderMessage = (
  step: Step,
  action:
    | 'visiting'
    | IInitiativeAction
    | IParticipationContextPermissionAction
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
  invitation_error: messages.invitationError,
  franceconnect_merging_failed: messages.franceConnectMergingFailed,
  email_taken_and_user_can_be_verified: messages.emailTakenAndUserCanBeVerified,
  not_entitled_under_15_years_of_age:
    messages.copenhagenUnder15VerificationFailed,
};

type HelperTextKey = 'signup_helper_text' | 'custom_fields_signup_helper_text';

const HELPER_TEXT_KEYS: Partial<Record<Step, HelperTextKey>> = {
  'sign-up:auth-providers': 'signup_helper_text',
  'sign-up:email-password': 'signup_helper_text',
  'sign-up:custom-fields': 'custom_fields_signup_helper_text',
  'missing-data:custom-fields': 'custom_fields_signup_helper_text',
};

interface Props {
  setModalOpen: (bool: boolean) => void;
}

const AuthModal = ({ setModalOpen }: Props) => {
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
    setModalOpen(currentStep !== 'closed');
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
    currentStep !== 'clave-unica:email';

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

        {currentStep === 'sign-up:email-confirmation' && (
          <EmailConfirmation
            state={state}
            loading={loading}
            setError={setError}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
            onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          />
        )}

        {currentStep === 'sign-up:change-email' && (
          <ChangeEmail
            loading={loading}
            setError={setError}
            onGoBack={transition(currentStep, 'GO_BACK')}
            onChangeEmail={transition(currentStep, 'RESEND_CODE')}
          />
        )}

        {currentStep === 'sign-up:verification' && (
          <Verification
            authenticationData={authenticationData}
            setError={setError}
            onCompleted={transition(currentStep, 'CONTINUE')}
          />
        )}

        {currentStep === 'sign-up:custom-fields' && (
          <CustomFields
            authenticationData={authenticationData}
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT')}
            onSkip={transition(currentStep, 'SKIP')}
          />
        )}

        {currentStep === 'sign-up:invite' && (
          <Invitation
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT')}
          />
        )}

        {currentStep === 'clave-unica:email' && (
          <ClaveUnicaEmail
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT_EMAIL')}
          />
        )}

        {currentStep === 'clave-unica:email-confirmation' && (
          <EmailConfirmation
            state={state}
            loading={loading}
            setError={setError}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
            onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
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

        {currentStep === 'light-flow:france-connect-login' && (
          <FranceConnectLogin onLogin={transition(currentStep, 'LOGIN')} />
        )}

        {currentStep === 'light-flow:email-confirmation' && (
          <EmailConfirmation
            state={state}
            loading={loading}
            setError={setError}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
            onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          />
        )}

        {currentStep === 'light-flow:password' && (
          <Password
            state={state}
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT_PASSWORD')}
          />
        )}

        {/* missing data flow */}
        {currentStep === 'missing-data:built-in' && (
          <BuiltInFields
            loading={loading}
            authenticationData={authenticationData}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT')}
          />
        )}

        {currentStep === 'missing-data:email-confirmation' && (
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

        {currentStep === 'missing-data:verification' && (
          <Verification
            authenticationData={authenticationData}
            setError={setError}
            onCompleted={transition(currentStep, 'CONTINUE')}
          />
        )}

        {currentStep === 'missing-data:custom-fields' && (
          <CustomFields
            authenticationData={authenticationData}
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT')}
            onSkip={transition(currentStep, 'SKIP')}
          />
        )}

        {/* verification only */}
        {currentStep === 'verification-only' && (
          <Verification
            authenticationData={authenticationData}
            setError={setError}
            onCompleted={transition(currentStep, 'CONTINUE')}
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
