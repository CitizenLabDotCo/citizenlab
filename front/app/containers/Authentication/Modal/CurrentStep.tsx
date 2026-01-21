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
  switch (currentStep) {
    case 'success':
      return (
        <Success
          loading={loading}
          onContinue={transition(currentStep, 'CONTINUE')}
        />
      );

    // email flow
    case 'email:start':
    case 'post-participation:email':
      return (
        <EmailFlowStart
          loading={loading}
          setError={setError}
          onSubmit={transition(currentStep, 'SUBMIT_EMAIL')}
          onSwitchToSSO={transition(currentStep, 'CONTINUE_WITH_SSO')}
        />
      );

    case 'email:policies':
      return (
        <EmailPolicies
          state={state}
          loading={loading}
          setError={setError}
          onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          goBack={transition(currentStep, 'GO_BACK')}
        />
      );

    case 'email:password':
      return (
        <Password
          state={state}
          loading={loading}
          setError={setError}
          onSubmit={transition(currentStep, 'SUBMIT_PASSWORD')}
          onClose={transition(currentStep, 'CLOSE')}
        />
      );

    case 'email:sso-policies':
      return (
        <SSOPolicies
          state={state}
          loading={loading}
          onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
        />
      );

    case 'email:confirmation':
      return (
        <EmailConfirmation
          state={state}
          loading={loading}
          setError={setError}
          onConfirm={transition(currentStep, 'SUBMIT_CODE')}
          onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          onResendCode={transition(currentStep, 'RESEND_CODE')}
        />
      );

    // invite flow
    case 'invite:email-password':
      return (
        <InviteSignUp
          state={state}
          loading={loading}
          setError={setError}
          onSubmit={transition(currentStep, 'SUBMIT')}
        />
      );

    case 'invite:code':
      return (
        <Invitation
          loading={loading}
          setError={setError}
          onSubmit={transition(currentStep, 'SUBMIT')}
        />
      );

    case 'invite:taken':
      return <InviteTaken state={state} />;

    // missing data flow / shared
    case 'missing-data:built-in':
      return (
        <BuiltInFields
          loading={loading}
          authenticationData={authenticationData}
          setError={setError}
          onSubmit={transition(currentStep, 'SUBMIT')}
        />
      );

    case 'missing-data:email-confirmation':
      return (
        <EmailConfirmation
          state={state}
          loading={loading}
          setError={setError}
          onConfirm={transition(currentStep, 'SUBMIT_CODE')}
          onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          onResendCode={transition(currentStep, 'RESEND_CODE')}
        />
      );

    case 'missing-data:verification':
    case 'verification-only':
      return (
        <Verification
          setError={setError}
          onCompleted={transition(currentStep, 'CONTINUE')}
          authenticationData={authenticationData}
        />
      );

    case 'missing-data:custom-fields':
      return (
        <Suspense fallback={<Spinner />}>
          <CustomFields
            authenticationData={authenticationData}
            loading={loading}
            setError={setError}
            onSubmit={transition(currentStep, 'SUBMIT')}
            onSkip={transition(currentStep, 'SKIP')}
          />
        </Suspense>
      );

    case 'missing-data:onboarding':
      return (
        <Onboarding
          authenticationData={authenticationData}
          onSubmit={transition(currentStep, 'SUBMIT')}
          onSkip={transition(currentStep, 'SKIP')}
        />
      );

    case 'verification-success':
      return <VerificationSuccess onClose={transition(currentStep, 'CLOSE')} />;

    // sso verification flow
    case 'sso-verification:sso-providers':
      return (
        <SSOVerification
          onClickSSO={transition(currentStep, 'CONTINUE_WITH_SSO')}
          onClickLogin={transition(currentStep, 'GO_TO_LOGIN')}
        />
      );

    case 'sso-verification:sso-providers-policies':
      return (
        <SSOVerificationPolicies
          state={state}
          loading={loading}
          onAccept={transition(currentStep, 'ACCEPT')}
        />
      );

    // other
    case 'access-denied':
      return (
        <AccessDenied
          authenticationData={authenticationData}
          onClose={transition(currentStep, 'CLOSE')}
        />
      );

    case 'closed':
      return null;

    default: {
      const exhaustiveCheck: never = currentStep;
      throw new Error(`Unhandled step: ${exhaustiveCheck}`);
    }
  }
};

export default CurrentStep;
