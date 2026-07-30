import {
  GetRequirements,
  UpdateState,
  AuthenticationData,
  SetError,
  State,
  SSOProviderWithoutVienna,
} from '../../typings';

import { confirmationSteps } from './confirmationSteps';
import { inviteFlow } from './inviteFlow';
import { missingDataFlow } from './missingDataFlow';
import { preAuthSteps } from './preAuthSteps';
import { sharedSteps } from './sharedSteps';
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
    ...preAuthSteps(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      updateState,
      state
    ),

    ...confirmationSteps(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
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
