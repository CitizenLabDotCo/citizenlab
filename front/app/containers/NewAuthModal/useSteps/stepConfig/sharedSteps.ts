import { parse } from 'qs';

// cache
import streams from 'utils/streams';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// events
import { triggerSuccessAction } from 'containers/NewAuthModal/SuccessActions';

// utils
import { requiredCustomFields, requiredBuiltInFields } from './utils';

// typings
import {
  GetRequirements,
  UpdateState,
  AuthenticationData,
  Status,
} from '../../typings';
import { Step } from './typings';

export const sharedSteps = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setStatus: (status: Status) => void,
  updateState: UpdateState,
  anySSOEnabled: boolean
) => {
  return {
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

      // When the user returns from SSO
      RESUME_FLOW_AFTER_SSO: async () => {
        // TODO
      },

      // When the authentication flow is triggered by an action
      // done by the user
      TRIGGER_REGISTRATION_FLOW: async () => {
        updateState({ email: null, token: null });

        const { requirements } = await getRequirements();

        const signedIn = requirements.built_in.email === 'satisfied';

        if (signedIn) {
          if (requirements.special.confirmation === 'require') {
            setCurrentStep('missing-data:email-confirmation');
            return;
          }

          if (requiredBuiltInFields(requirements.built_in)) {
            setCurrentStep('missing-data:built-in');
            return;
          }

          if (requirements.special.verification === 'require') {
            setCurrentStep('missing-data:verification');
            return;
          }

          if (requiredCustomFields(requirements.custom_fields)) {
            setCurrentStep('missing-data:custom-fields');
            return;
          }

          return;
        }

        const isLightFlow = requirements.special.password === 'dont_ask';

        if (isLightFlow) {
          setCurrentStep('light-flow:email');
          return;
        }

        const { flow } = getAuthenticationData();

        if (flow === 'signin') {
          anySSOEnabled
            ? setCurrentStep('sign-in:auth-providers')
            : setCurrentStep('sign-in:email-password');
          return;
        }

        if (flow === 'signup') {
          anySSOEnabled
            ? setCurrentStep('sign-up:auth-providers')
            : setCurrentStep('sign-up:email-password');
          return;
        }
      },

      TRIGGER_VERIFICATION_ONLY: () => {
        setCurrentStep('verification-only');
      },
    },

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
