import React, { lazy, Suspense } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import AccessDenied from '../steps/AccessDenied';
import BuiltInFields from '../steps/BuiltInFields';
import EmailConfirmation from '../steps/EmailConfirmation';
import EmailFlowStart from '../steps/EmailFlowStart';
import Invitation from '../steps/Invitation';
import InviteSignUp from '../steps/InviteSignUp';
import InviteTaken from '../steps/InviteTaken';
import Onboarding from '../steps/Onboarding';
import Password from '../steps/Password';
import EmailPolicies from '../steps/Policies/EmailPolicies';
import SSOPolicies from '../steps/Policies/SSOPolicies';
import PostParticipationFlowStart from '../steps/PostParticipationFlowStart';
import SSOVerification from '../steps/SSOVerification';
import SSOVerificationPolicies from '../steps/SSOVerificationPolicies';
import Success from '../steps/Success';
import Verification from '../steps/Verification';
import VerificationSuccess from '../steps/VerificationSuccess';
import { AuthenticationData, SetError, State, Step } from '../typings';
import useSteps from '../useSteps';

// All steps above could be lazy loaded
// but this one was the worst in terms of bundle size impact
const CustomFields = lazy(() => import('../steps/CustomFields'));

interface Props {
  currentStep: Step;
  state: State;
  loading: boolean;
  authenticationData: AuthenticationData;
  transition: ReturnType<typeof useSteps>['transition'];
  setError: SetError;
}

const CurrentStep = ({
  currentStep,
  state,
  loading,
  authenticationData,
  transition,
  setError,
}: Props) => {
  return (
    <>
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

      {currentStep === 'post-participation:email' && (
        <PostParticipationFlowStart
          loading={loading}
          setError={setError}
          onSubmit={transition(currentStep, 'SUBMIT_EMAIL')}
          onSwitchToSSO={transition(currentStep, 'CONTINUE_WITH_SSO')}
        />
      )}
    </>
  );
};

export default CurrentStep;
