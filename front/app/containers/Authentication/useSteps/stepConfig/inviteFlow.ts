import { requestCodeEmail } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import createAccountFromInvite, {
  acceptInvite,
  Parameters as CreateAccountFromInviteParameters,
} from 'api/authentication/createAccountFromInvite';
import getUserDataFromToken from 'api/authentication/getUserDataFromToken';

import { reportError } from 'utils/loggingUtils';

import {
  AuthenticationData,
  GetRequirements,
  SetError,
  UpdateState,
} from '../../typings';

import { Step } from './typings';
import {
  doesNotMeetGroupCriteria,
  checkMissingData,
  trackAuthenticated,
} from './utils';

export const inviteFlow = (
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  setError: SetError,
  updateState: UpdateState
) => {
  return {
    'invite:email-password': {
      CLOSE: () => {
        setCurrentStep('closed');
      },
      SUBMIT: async (params: CreateAccountFromInviteParameters) => {
        try {
          const { password, ...rest } = params;

          // No password means an invitation code: the email typed in still has
          // to be confirmed, and the password comes after that.
          if (password === undefined) {
            await acceptInvite(rest);
            updateState({ email: rest.email, flow: 'signup' });
            setCurrentStep('pre-auth:unauthenticated-confirmation');

            // The invite is used up by now, so a code email that fails to go
            // out must not stop here: the confirmation step tells the user and
            // can send it again.
            await requestCodeEmail(rest.email).catch((e) => {
              reportError(e);
              setError('resending_code_failed');
            });
            return;
          }

          await createAccountFromInvite({ ...rest, password });
          trackAuthenticated('signup', 'invite');

          const { requirements } = await getRequirements();
          const authenticationData = getAuthenticationData();

          const missingDataStep = await checkMissingData(
            requirements,
            authenticationData,
            'signup'
          );

          if (missingDataStep) {
            setCurrentStep(missingDataStep);
            return;
          }

          if (doesNotMeetGroupCriteria(requirements)) {
            setCurrentStep('access-denied');
            return;
          }

          setCurrentStep('success');
        } catch (e) {
          if (e.errors?.email?.[0]?.error === 'taken_by_invite') {
            // If the invitation is already taken:
            // Store email in state to use in invite:taken step
            updateState({ email: params.email });

            // Go to step where user can enter invitation token again
            setCurrentStep('invite:taken');
          } else {
            throw e;
          }
        }
      },
    },

    'invite:code': {
      CLOSE: () => setCurrentStep('closed'),
      SUBMIT: async (token: string) => {
        const response = await getUserDataFromToken(token);

        const prefilledBuiltInFields = {
          first_name: response.data.attributes.first_name ?? undefined,
          last_name: response.data.attributes.last_name ?? undefined,
          email: response.data.attributes.email ?? undefined,
        };

        updateState({ token, prefilledBuiltInFields });

        setCurrentStep('invite:email-password');
      },
    },

    'invite:taken': {
      CLOSE: () => setCurrentStep('closed'),
    },
  };
};
