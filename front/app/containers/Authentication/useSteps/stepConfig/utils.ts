import {
  ActionRequiredForAccess,
  AuthenticationRequirements,
} from 'api/authentication/authentication_requirements/types';
import { requestCodeEmail } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import { requestCodePhone } from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import { redirectToSSOProvider } from 'api/authentication/singleSignOn';
import { checkEmail, checkPhone } from 'api/users/checkUser';

import {
  GetRequirements,
  UpdateState,
  AuthenticationData,
  SSOProviderWithoutVienna,
  State,
} from '../../typings';

import { Step } from './typings';

export const checkMissingData = async (
  requirements: AuthenticationRequirements['requirements'],
  { context }: AuthenticationData,
  flow: 'signup' | 'signin'
) => {
  const action = requirements.authentication.action_required_for_access;
  const actionStep = action ? ACTION_STEPS[action] : null;

  if (actionStep) {
    // These actions land the user on a confirmation step without a code having
    // been auto-sent, so request one. The call is idempotent (onlyIfFirstTime)
    // and authenticated (backend uses current_user), so reopening the flow won't
    // duplicate it. Awaited on purpose: the code only exists once this resolves,
    // so returning earlier would show the code input for a code that hasn't been
    // generated yet, and a code submitted in that window is rejected as invalid.
    // Failures are swallowed - the user falls back to the resend button.
    if (action === 'reconfirm_email') {
      await requestCodeEmail({ onlyIfFirstTime: true });
    }
    if (action === 'reconfirm_phone' || action === 'confirm_phone') {
      await requestCodePhone({ onlyIfFirstTime: true });
    }
    return actionStep;
  }

  // The remaining built-in fields (name/password) plus providing an email are
  // all collected on the built-in step - see requiredBuiltInFields.
  if (requiredBuiltInFields(requirements)) {
    return 'missing-data:built-in';
  }

  if (requirements.verification) {
    return 'missing-data:verification';
  }

  const isGlobalSignInFlow =
    flow === 'signin' &&
    context.action === 'visiting' &&
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    context.type === 'global';

  // In the global sign in flow, we only want to show the custom
  // fields step if there are required custom fields.
  // Otherwise it's kind of annoying, because every time you log
  // in you get asked to fill them out.
  // NOTE: maybe this should be calculated in the BE instead.
  if (isGlobalSignInFlow && requiredCustomFields(requirements)) {
    return 'missing-data:custom-fields';
  }

  // In any other situation we just ask for all custom fields
  if (!isGlobalSignInFlow && askCustomFields(requirements)) {
    return 'missing-data:custom-fields';
  }

  if (showOnboarding(requirements)) {
    return 'missing-data:onboarding';
  }

  return null;
};

export const doesNotMeetGroupCriteria = (
  requirements: AuthenticationRequirements['requirements']
) => {
  return requirements.group_membership;
};

// The screen that resolves each action. `provide_new_email` is null because the
// email input lives on the built-in step (see requiredBuiltInFields).
const ACTION_STEPS: Record<ActionRequiredForAccess, Step | null> = {
  authenticate: 'pre-auth:start',
  confirm_email: 'pre-auth:unauthenticated-confirmation',
  reconfirm_email: 'confirmation:reconfirm-email',
  provide_new_email: null,
  confirm_new_email: 'confirmation:new_email',
  confirm_phone: 'confirmation:reconfirm-phone',
  reconfirm_phone: 'confirmation:reconfirm-phone',
  provide_new_phone: 'missing-data:new_phone',
  confirm_new_phone: 'confirmation:new_phone',
};

export const showOnboarding = (
  requirements: AuthenticationRequirements['requirements']
) => {
  return requirements.onboarding;
};

const askCustomFields = (
  requirements: AuthenticationRequirements['requirements']
) => {
  const { custom_fields } = requirements;
  return Object.keys(custom_fields).length > 0;
};

const requiredCustomFields = (
  requirements: AuthenticationRequirements['requirements']
) => {
  const { custom_fields } = requirements;

  for (const fieldName in custom_fields) {
    if (custom_fields[fieldName] === 'required') {
      return true;
    }
  }

  return false;
};

export const askEmailOnBuiltInStep = (
  requirements: AuthenticationRequirements['requirements']
) =>
  requirements.authentication.action_required_for_access ===
  'provide_new_email';

const requiredBuiltInFields = (
  requirements: AuthenticationRequirements['requirements']
) => {
  const missingAttributes = new Set(
    requirements.authentication.missing_user_attributes
  );

  const askFirstName = missingAttributes.has('first_name');
  const askLastName = missingAttributes.has('last_name');
  const askPassword = missingAttributes.has('password');

  return (
    askFirstName ||
    askLastName ||
    askPassword ||
    askEmailOnBuiltInStep(requirements)
  );
};

export const handleSubmitEmail = async (
  email: string,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState
) => {
  try {
    const response = await checkEmail(email);
    const { action } = response.data.attributes;

    if (action === 'terms') {
      updateState({ flow: 'signup' });
      setCurrentStep('pre-auth:policies');
    }

    if (action === 'password') {
      updateState({ flow: 'signin' });
      setCurrentStep('pre-auth:password');
    }

    if (action === 'confirm') {
      updateState({ flow: 'signin' });
      setCurrentStep('pre-auth:unauthenticated-confirmation');
    }
  } catch (e) {
    if (e.errors?.email?.[0]?.error === 'taken_by_invite') {
      setCurrentStep('invite:taken');
    } else {
      throw e;
    }
  }
};

// The phone mirror of handleSubmitEmail. Invites are never sent to a phone
// number, so there is no taken_by_invite case here.
export const handleSubmitPhone = async (
  phone: string,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState
) => {
  const response = await checkPhone(phone);
  const { action } = response.data.attributes;

  if (action === 'terms') {
    updateState({ flow: 'signup' });
    setCurrentStep('pre-auth:phone-policies');
  }

  if (action === 'password') {
    updateState({ flow: 'signin' });
    setCurrentStep('pre-auth:password');
  }

  if (action === 'confirm') {
    updateState({ flow: 'signin' });
    setCurrentStep('pre-auth:unauthenticated-phone-confirmation');
  }
};

export const handleSSOClick = async (
  ssoProvider: SSOProviderWithoutVienna,
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
  setCurrentStep: (step: Step) => void,
  updateState: UpdateState,
  state: State,
  claimTokens?: string[]
) => {
  if (ssoProvider === 'clave_unica') {
    // If clave unica, we always go straight to SSO login
    redirectToSSOProvider(
      ssoProvider,
      getAuthenticationData(),
      true,
      state.flow,
      claimTokens
    );
  } else if (ssoProvider === 'franceconnect') {
    const { requirements } = await getRequirements();

    redirectToSSOProvider(
      'franceconnect',
      getAuthenticationData(),
      requirements.verification,
      'signin',
      claimTokens
    );
  } else {
    // If other SSO provider, it depends on the flow
    if (state.flow === 'signin') {
      redirectToSSOProvider(
        ssoProvider,
        getAuthenticationData(),
        true,
        state.flow,
        claimTokens
      );
    } else {
      updateState({ ssoProvider });
      setCurrentStep('pre-auth:sso-policies');
    }
  }
};
