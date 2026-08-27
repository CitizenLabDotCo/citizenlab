import React, { lazy, Suspense } from 'react';

import { Spinner } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import AccessDenied from '../steps/AccessDenied';
import BuiltInFields from '../steps/BuiltInFields';
import ChangeEmail from '../steps/ChangeEmail';
import EmailConfirmation from '../steps/EmailConfirmation';
import FlowStart from '../steps/FlowStart';
import Invitation from '../steps/Invitation';
import InviteSignUp from '../steps/InviteSignUp';
import InviteTaken from '../steps/InviteTaken';
import Onboarding from '../steps/Onboarding';
import Password from '../steps/Password';
import Phone from '../steps/Phone';
import PhoneConfirmation from '../steps/PhoneConfirmation';
import EmailPolicies from '../steps/Policies/EmailPolicies';
import PhonePolicies from '../steps/Policies/PhonePolicies';
import SSOPolicies from '../steps/Policies/SSOPolicies';
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
  const { data: authUser } = useAuthUser();

  switch (currentStep) {
    // shared
    case 'closed':
      return null;

    case 'success':
      return (
        <Success
          loading={loading}
          onContinue={transition(currentStep, 'CONTINUE')}
        />
      );

    case 'access-denied':
      return (
        <AccessDenied
          authenticationData={authenticationData}
          onClose={transition(currentStep, 'CLOSE')}
        />
      );

    // pre-auth steps
    // ('post-participation:email' is grouped here because it shares this body)
    case 'pre-auth:start':
    case 'post-participation:email':
      return (
        <FlowStart
          loading={loading}
          state={state}
          setError={setError}
          authenticationData={authenticationData}
          onSubmitEmail={transition(currentStep, 'SUBMIT_EMAIL')}
          onSubmitPhone={transition(currentStep, 'SUBMIT_PHONE')}
          onSwitchToSSO={transition(currentStep, 'CONTINUE_WITH_SSO')}
        />
      );

    case 'pre-auth:policies':
      return (
        <EmailPolicies
          state={state}
          loading={loading}
          setError={setError}
          onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          goBack={transition(currentStep, 'GO_BACK')}
        />
      );

    case 'pre-auth:phone-policies':
      return (
        <PhonePolicies
          state={state}
          loading={loading}
          setError={setError}
          onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
          goBack={transition(currentStep, 'GO_BACK')}
        />
      );

    case 'pre-auth:password':
      return (
        <Password
          state={state}
          loading={loading}
          setError={setError}
          onSubmit={transition(currentStep, 'SUBMIT_PASSWORD')}
          onClose={transition(currentStep, 'CLOSE')}
        />
      );

    case 'pre-auth:sso-policies':
      return (
        <SSOPolicies
          state={state}
          loading={loading}
          onAccept={transition(currentStep, 'ACCEPT_POLICIES')}
        />
      );

    case 'pre-auth:unauthenticated-confirmation':
      return (
        <EmailConfirmation
          email={state.email ?? null}
          loading={loading}
          setError={setError}
          onConfirm={transition(currentStep, 'SUBMIT_CODE')}
          onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          onResendCode={transition(currentStep, 'RESEND_CODE')}
        />
      );

    case 'pre-auth:unauthenticated-phone-confirmation':
      return (
        <PhoneConfirmation
          phone={state.phone ?? null}
          loading={loading}
          setError={setError}
          onConfirm={transition(currentStep, 'SUBMIT_CODE')}
          onChangePhone={transition(currentStep, 'CHANGE_PHONE')}
          onResendCode={transition(currentStep, 'RESEND_CODE')}
        />
      );

    // confirmation steps (code entry for email / phone)
    case 'confirmation:reconfirm-email':
      return (
        <EmailConfirmation
          email={state.email ?? authUser?.data.attributes.email ?? null}
          loading={loading}
          setError={setError}
          onConfirm={transition(currentStep, 'SUBMIT_CODE')}
          onResendCode={transition(currentStep, 'RESEND_CODE')}
        />
      );

    case 'confirmation:new_email':
      return (
        <EmailConfirmation
          email={state.new_email ?? authUser?.data.attributes.new_email ?? null}
          loading={loading}
          setError={setError}
          onConfirm={transition(currentStep, 'SUBMIT_CODE')}
          onChangeEmail={transition(currentStep, 'CHANGE_EMAIL')}
          onResendCode={transition(currentStep, 'RESEND_CODE')}
        />
      );

    case 'confirmation:reconfirm-phone':
      return (
        <PhoneConfirmation
          phone={authUser?.data.attributes.phone ?? null}
          loading={loading}
          setError={setError}
          onConfirm={transition(currentStep, 'SUBMIT_CODE')}
          onResendCode={transition(currentStep, 'RESEND_CODE')}
        />
      );

    case 'confirmation:new_phone':
      return (
        <PhoneConfirmation
          phone={state.new_phone ?? authUser?.data.attributes.new_phone ?? null}
          loading={loading}
          setError={setError}
          onConfirm={transition(currentStep, 'SUBMIT_CODE')}
          onChangePhone={transition(currentStep, 'CHANGE_PHONE')}
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

    // missing data (if signed in already)
    case 'missing-data:change-new-email':
      return (
        <ChangeEmail
          state={state}
          loading={loading}
          setError={setError}
          onSubmit={transition(currentStep, 'SUBMIT')}
        />
      );

    case 'missing-data:new_phone':
      return (
        <Phone
          state={state}
          loading={loading}
          setError={setError}
          onSubmit={transition(currentStep, 'SUBMIT')}
        />
      );

    case 'missing-data:built-in':
      return (
        <BuiltInFields
          loading={loading}
          authenticationData={authenticationData}
          setError={setError}
          onSubmit={transition(currentStep, 'SUBMIT')}
        />
      );

    // ('verification-only' is grouped here because it shares this body)
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

    // missing data (if signed in already) for onboarding
    case 'missing-data:onboarding':
      return (
        <Onboarding
          authenticationData={authenticationData}
          onSubmit={transition(currentStep, 'SUBMIT')}
          onSkip={transition(currentStep, 'SKIP')}
        />
      );

    // verification only (for onboarding and re-verification)
    case 'verification-success':
      return <VerificationSuccess onClose={transition(currentStep, 'CLOSE')} />;

    default: {
      const exhaustiveCheck: never = currentStep;
      throw new Error(`Unhandled step: ${exhaustiveCheck}`);
    }
  }
};

export default CurrentStep;
