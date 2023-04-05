// flows
import { oldSignInFlow } from './oldSignInFlow';
import { oldSignUpFlow } from './oldSignUpFlow';
import { newLightFlow } from './newLightFlow';

// cache
import streams from 'utils/streams';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

// events
import { triggerSuccessAction } from 'containers/NewAuthModal/SuccessActions';

// typings
import {
  GetRequirements,
  Status,
  ErrorCode,
  UpdateState,
  AuthenticationData,
} from '../../typings';
import { Step } from './typings';

export const getStepConfig = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void,
  setError: (errorCode: ErrorCode) => void,
  updateState: UpdateState,
  anySSOProviderEnabled: boolean
) => {
  return {
    // closed (shared)
    closed: {
      // When we fire this, we are already sure that we need the new flow.
      // i.e. we have already checked the requirements endpoint and stuff
      TRIGGER_REGISTRATION_FLOW: async () => {
        updateState({ email: null });

        const { permitted, requirements } = await getRequirements();

        if (permitted) {
          setCurrentStep('success');
          return;
        }

        const isLightFlow = requirements.special.password === 'dont_ask';
        const signedIn = requirements.built_in.email === 'satisfied';

        if (isLightFlow) {
          if (signedIn) {
            // TODO
          } else {
            if (requirements.built_in.email === 'satisfied') {
              setCurrentStep('light-flow:email-confirmation');
            } else {
              setCurrentStep('light-flow:email');
            }
          }

          return;
        }

        const { flow } = getAuthenticationData();

        if (flow === 'signin') {
          if (signedIn) {
            // TODO
          } else {
            if (anySSOProviderEnabled) {
              setCurrentStep('sign-in:auth-providers');
            } else {
              setCurrentStep('sign-in:email-password');
            }
          }

          return;
        }

        if (flow === 'signup') {
          if (signedIn) {
            // TODO
          } else {
            if (anySSOProviderEnabled) {
              setCurrentStep('sign-up:auth-providers');
            } else {
              setCurrentStep('sign-up:email-password');
            }
          }
        }
      },
    },

    ...oldSignInFlow(
      getAuthenticationData,
      setCurrentStep,
      setStatus,
      setError,
      anySSOProviderEnabled
    ),

    ...oldSignUpFlow(
      getAuthenticationData,
      setCurrentStep,
      setStatus,
      anySSOProviderEnabled
    ),

    ...newLightFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setStatus,
      setError,
      updateState
    ),

    // success (shared)
    success: {
      CONTINUE: async () => {
        setStatus('pending');

        await Promise.all([streams.reset(), resetQueryCache()]);

        setStatus('ok');
        setCurrentStep('closed');

        const { successAction } = getAuthenticationData();
        if (successAction) {
          triggerSuccessAction(successAction);
        }
      },
    },
  };
};
