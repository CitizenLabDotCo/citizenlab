import { parse } from 'qs';

// flows
import { oldSignInFlow } from './oldSignInFlow';
import { oldSignUpFlow } from './oldSignUpFlow';
import { newLightFlow } from './newLightFlow';

// cache
import streams from 'utils/streams';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// events
import { triggerSuccessAction } from 'containers/NewAuthModal/SuccessActions';

// utils
import { askCustomFields } from './utils';

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
  anySSOEnabled: boolean
) => {
  return {
    // closed (shared)
    closed: {
      // When the user entered the platform through an invite link
      START_INVITE_FLOW: async (search: string) => {
        const params = parse(search, { ignoreQueryPrefix: true });
        const token = params.token;

        if (typeof token === 'string') {
          updateState({ token });
          setCurrentStep('sign-up:email-password');
        } else {
          setCurrentStep('closed'); // TODO
        }
      },

      // When the authentication flow is triggered by an action
      // done by the user
      TRIGGER_REGISTRATION_FLOW: async () => {
        updateState({ email: null, token: null });

        const { requirements } = await getRequirements();

        const isLightFlow = requirements.special.password === 'dont_ask';
        const signedIn = requirements.built_in.email === 'satisfied';

        if (isLightFlow) {
          if (signedIn) {
            setCurrentStep('light-flow:email-confirmation');
          } else {
            setCurrentStep('light-flow:email');
          }
          return;
        }

        const { flow } = getAuthenticationData();

        if (flow === 'signin' && !signedIn) {
          if (anySSOEnabled) {
            setCurrentStep('sign-in:auth-providers');
          } else {
            setCurrentStep('sign-in:email-password');
          }

          return;
        }

        if (flow === 'signup') {
          if (signedIn) {
            if (requirements.special.confirmation === 'require') {
              setCurrentStep('sign-up:email-confirmation');
              return;
            }

            if (requirements.special.verification === 'require') {
              setCurrentStep('sign-up:verification');
              return;
            }

            if (askCustomFields(requirements.custom_fields)) {
              setCurrentStep('sign-up:custom-fields');
              return;
            }
          } else {
            if (anySSOEnabled) {
              setCurrentStep('sign-up:auth-providers');
            } else {
              setCurrentStep('sign-up:email-password');
            }
          }
        }
      },

      TRIGGER_VERIFICATION_ONLY: () => {
        setCurrentStep('verification-only');
      },
    },

    ...oldSignInFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setStatus,
      setError,
      anySSOEnabled
    ),

    ...oldSignUpFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setStatus,
      setError,
      anySSOEnabled
    ),

    ...newLightFlow(
      getAuthenticationData,
      getRequirements,
      setCurrentStep,
      setStatus,
      setError,
      updateState
    ),

    'verification-only': {
      CLOSE: () => setCurrentStep('closed'),
      CONTINUE: () => setCurrentStep('verification-success'), // TODO see if there's any success window right now?
    },

    'verification-success': {
      CLOSE: () => setCurrentStep('closed'),
    },

    // success (shared)
    success: {
      CONTINUE: async () => {
        setStatus('pending');

        await Promise.all([streams.reset(), resetQueryCache()]);

        setStatus('ok');
        setCurrentStep('closed');

        trackEventByName(tracks.signUpFlowCompleted);

        const { successAction } = getAuthenticationData();
        if (successAction) {
          triggerSuccessAction(successAction);
        }
      },
    },
  };
};
