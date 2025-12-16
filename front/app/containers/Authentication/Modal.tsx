import React, { lazy, Suspense } from 'react';

import {
  Box,
  Spinner,
  Title,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { useIntl, FormattedMessage } from 'utils/cl-intl';

import messages from './messages';
import {
  getHeaderMessage,
  HELPER_TEXT_KEYS,
  ERROR_CODE_MESSAGES,
} from './messageUtils';
import TextButton from './steps/_components/TextButton';
import AccessDenied from './steps/AccessDenied';
import BuiltInFields from './steps/BuiltInFields';
import EmailConfirmation from './steps/EmailConfirmation';
import EmailFlowStart from './steps/EmailFlowStart';
import Invitation from './steps/Invitation';
import InviteSignUp from './steps/InviteSignUp';
import InviteTaken from './steps/InviteTaken';
import Onboarding from './steps/Onboarding';
import Password from './steps/Password';
import EmailPolicies from './steps/Policies/EmailPolicies';
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
  const localize = useLocalize();

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

  const localizedHelperText = localize(helperText);

  const showHelperText =
    helperText && localizedHelperText && localizedHelperText.length > 0;

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
                  values={{
                    br: <br />,
                    createAnAccountLink: (
                      <TextButton
                        onClick={
                          currentStep === 'email:password'
                            ? transition(currentStep, 'GO_BACK')
                            : undefined
                        }
                      >
                        {formatMessage(messages.createAnAccountLink)}
                      </TextButton>
                    ),
                  }}
                />
              }
            />
          </Box>
        )}
        {showHelperText && (
          <Box mb="20px">
            <QuillEditedContent
              textColor={theme.colors.tenantText}
              fontSize="base"
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

        {/* email flow */}
        {currentStep === 'email:start' && (
          <EmailFlowStart
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT_EMAIL')}
            onSwitchToSSO={transition(currentStep, 'CONTINUE_WITH_SSO')}
            onEnterFranceConnect={transition(
              currentStep,
              'ENTER_FRANCE_CONNECT'
            )}
          />
        )}
        {currentStep === 'email:policies' && (
          <EmailPolicies
            state={state}
            loading={loading}
            setError={setError}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
            goBack={transition(currentStep, 'GO_BACK')}
          />
        )}
        {currentStep === 'email:password' && (
          <Password
            state={state}
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT_PASSWORD')}
            onClose={transition(currentStep, 'CLOSE')}
          />
        )}
        {currentStep === 'email:sso-policies' && (
          <SSOPolicies
            state={state}
            loading={loading}
            onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          />
        )}
        {currentStep === 'email:confirmation' && (
          <EmailConfirmation
            state={state}
            loading={loading}
            setError={setError}
            onConfirm={transition(currentStep, 'SUBMIT_CODE')}
            onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
            onResendCode={transition(currentStep, 'RESEND_CODE')}
          />
        )}

        {/* invite flow */}
        {currentStep === 'invite:email-password' && (
          <InviteSignUp
            state={state}
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT')}
          />
        )}
        {currentStep === 'invite:code' && (
          <Invitation
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT')}
          />
        )}
        {currentStep === 'invite:taken' && <InviteTaken state={state} />}

        {/* missing data flow / shared */}
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
            onResendCode={transition(currentStep, 'RESEND_CODE')}
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
          <Suspense fallback={<Spinner />}>
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
