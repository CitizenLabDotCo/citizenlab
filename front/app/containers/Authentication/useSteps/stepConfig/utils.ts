import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';
import { requestCodeEmail } from 'api/authentication/confirm_email/requestEmailConfirmationCode';
import { requestCodeNewPhone } from 'api/authentication/confirm_phone/requestPhoneConfirmationCode';
import { redirectToSSOProvider } from 'api/authentication/singleSignOn';
import checkUser from 'api/users/checkUser';

import {
  GetRequirements,
  UpdateState,
  AuthenticationData,
  SSOProviderWithoutVienna,
  State,
} from '../../typings';

import { Step } from './typings';

export const checkMissingData = (
  requirements: AuthenticationRequirements['requirements'],
  { context }: AuthenticationData,
  flow: 'signup' | 'signin'
) => {
  // The email/phone action encodes both the step and the request/confirm
  // endpoint pair the user needs (provide vs confirm, own email vs new_email).
  const emailStep = emailActionStep(requirements);
  if (emailStep) {
    // Re-confirmation (confirmed_email_expiry elapsed) lands the user on the
    // confirmation step without a code having been auto-sent, so request one.
    // The call is idempotent (if_needed) and authenticated (backend uses
    // current_user), so no email is passed and reopening the flow won't
    // duplicate. Fire-and-forget: failures fall back to the resend button.
    if (
      requirements.authentication.email_action_required === 'reconfirm_email'
    ) {
      void requestCodeEmail(undefined, { ifNeeded: true }).catch(() => {});
    }
    return emailStep;
  }

  const phoneStep = phoneActionStep(requirements);
  if (phoneStep) {
    if (
      requirements.authentication.phone_action_required === 'reconfirm_phone'
    ) {
      void requestCodeNewPhone(undefined, { ifNeeded: true }).catch(() => {});
    }
    return phoneStep;
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

// Maps email_action_required to the step that resolves it. The provide actions
// return null here because the email input lives on the built-in step (see
// requiredBuiltInFields); confirm_email uses the unauthenticated in-place
// confirmation, confirm_new_email the authenticated new_email confirmation.
const emailActionStep = (
  requirements: AuthenticationRequirements['requirements']
): Step | null => {
  switch (requirements.authentication.email_action_required) {
    case 'confirm_email':
    case 'reconfirm_email':
      return 'confirmation:email';
    case 'confirm_new_email':
      return 'confirmation:new_email';
    default:
      return null;
  }
};

// Maps phone_action_required to its step. Both provide actions collect the
// number on the phone step; confirm_new_phone jumps straight to confirmation.
const phoneActionStep = (
  requirements: AuthenticationRequirements['requirements']
): Step | null => {
  switch (requirements.authentication.phone_action_required) {
    case 'provide_phone':
      return 'missing-data:phone';
    case 'provide_new_phone':
      return 'missing-data:phone';
    case 'confirm_phone':
      // A never-confirmed existing phone: there is no in-place phone confirmation,
      // so re-collect the number (submitting it sends the code via new_phone).
      return 'missing-data:phone';
    case 'reconfirm_phone':
      // Re-confirmation of the user's own phone (expiry elapsed): the code is
      // auto-sent to the existing number (see checkMissingData), so go straight
      // to code entry, mirroring reconfirm_email -> confirmation:email.
      return 'confirmation:new_phone';
    case 'confirm_new_phone':
      return 'confirmation:new_phone';
    default:
      return null;
  }
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

// Whether the user should provide an email as part of the built-in step. This
// is a "provide" action (the value gets stored in email/new_email and confirmed
// afterwards) - the confirm actions are handled by emailActionStep instead.
export const askEmailOnBuiltInStep = (
  requirements: AuthenticationRequirements['requirements']
) => {
  const { email_action_required } = requirements.authentication;
  return (
    email_action_required === 'provide_email' ||
    email_action_required === 'provide_new_email'
  );
};

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
    const response = await checkUser(email);
    const { action } = response.data.attributes;

    if (action === 'terms') {
      updateState({ flow: 'signup' });
      setCurrentStep('email:policies');
    }

    if (action === 'password') {
      updateState({ flow: 'signin' });
      setCurrentStep('email:password');
    }

    if (action === 'confirm') {
      updateState({ flow: 'signin' });
      setCurrentStep('confirmation:email');
    }
  } catch (e) {
    if (e.errors?.email?.[0]?.error === 'taken_by_invite') {
      setCurrentStep('invite:taken');
    } else {
      throw e;
    }
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
      setCurrentStep('email:sso-policies');
    }
  }
};
