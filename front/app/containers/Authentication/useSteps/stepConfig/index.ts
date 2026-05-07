import {
  GetRequirements,
  UpdateState,
  AuthenticationData,
  SetError,
  State,
  SSOProviderWithoutVienna,
} from '../../typings';

import { emailFlow } from './emailFlow';
import { inviteFlow } from './inviteFlow';
import { missingDataFlow } from './missingDataFlow';
import { sharedSteps } from './sharedSteps';
import { ssoVerificationFlow } from './ssoVerificationFlow';
import { Step } from './typings';
import { handleSubmitEmail, handleSSOClick } from './utils';

export const getStepConfig = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setError: SetError,
  updateState: UpdateState,
  state: State
) => {
  return {
    ...emailFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState,
      state
    ),

    ...inviteFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState
    ),

    ...missingDataFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState,
      state
    ),

    ...sharedSteps(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setError,
      updateState
    ),

    ...ssoVerificationFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState
    ),

    'verification-only': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE: () => setCurrentStep('verification-success'),
    },

    'verification-success': {
      CLOSE: () => setCurrentStep('closed'),
    },

    'post-participation:email': {
      CLOSE: () => setCurrentStep('closed'),

      SUBMIT_EMAIL: async (email: string) => {
        updateState({ email });
        await handleSubmitEmail(email, setCurrentStep, updateState);
      },

      CONTINUE_WITH_SSO: async (ssoProvider: SSOProviderWithoutVienna) => {
        handleSSOClick(
          ssoProvider,
          getAuthenticationData,
          getRequirements,
          setCurrentStep,
          updateState,
          state,
          state.claimTokens ?? undefined
        );
      },
    },
  };
};
