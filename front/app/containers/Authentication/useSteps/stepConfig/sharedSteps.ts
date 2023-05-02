import { parse } from 'qs';

// api
import getUserDataFromToken from 'api/authentication/getUserDataFromToken';

// cache
import streams from 'utils/streams';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// events
import { triggerSuccessAction } from 'containers/Authentication/SuccessActions';

// utils
import {
  requiredCustomFields,
  requiredBuiltInFields,
  askCustomFields,
} from './utils';

// typings
import {
  GetRequirements,
  UpdateState,
  AuthenticationData,
} from '../../typings';
import { Step } from './typings';

export const sharedSteps = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
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
          const response = await getUserDataFromToken(token);

          const prefilledBuiltInFields = {
            first_name: response.data.attributes.first_name ?? undefined,
            last_name: response.data.attributes.last_name ?? undefined,
            email: response.data.attributes.email ?? undefined,
          };

          updateState({ token, prefilledBuiltInFields });
          setCurrentStep('sign-up:email-password');
        } else {
          setCurrentStep('sign-up:invite');
        }
      },

      // When the user returns from SSO
      RESUME_FLOW_AFTER_SSO: async () => {
        const { flow } = getAuthenticationData();
        const { requirements } = await getRequirements();

        if (flow === 'signup') {
          if (requirements.special.verification === 'require') {
            setCurrentStep('sign-up:verification');
            return;
          }

          if (askCustomFields(requirements.custom_fields)) {
            setCurrentStep('sign-up:custom-fields');
            return;
          }

          setCurrentStep('success');
        }

        if (flow === 'signin') {
          if (requirements.special.verification === 'require') {
            setCurrentStep('missing-data:verification');
            return;
          }

          if (requiredCustomFields(requirements.custom_fields)) {
            setCurrentStep('missing-data:custom-fields');
            return;
          }
        }
      },

      // When the authentication flow is triggered by an action
      // done by the user
      TRIGGER_REGISTRATION_FLOW: async () => {
        updateState({
          email: null,
          token: null,
          prefilledBuiltInFields: null,
        });

        const { requirements } = await getRequirements();

        const isLightFlow = requirements.special.password === 'dont_ask';
        const signedIn = requirements.built_in.email === 'satisfied';

        if (isLightFlow) {
          if (!signedIn) {
            setCurrentStep('light-flow:email');
            return;
          }

          if (requirements.special.confirmation === 'require') {
            setCurrentStep('light-flow:email-confirmation');
            return;
          }
        }

        if (signedIn) {
          if (requirements.special.confirmation === 'require') {
            setCurrentStep('missing-data:email-confirmation');
            return;
          }

          if (requiredBuiltInFields(requirements)) {
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
        await Promise.all([streams.reset(), resetQueryCache()]);
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
