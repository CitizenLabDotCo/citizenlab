import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';
import getUserTokenUnconfirmed from 'api/authentication/sign_in_out/getUserTokenUnconfirmed';
import { handleOnSSOClick } from 'api/authentication/singleSignOn';
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
  flow: 'signup' | 'signin',
  userIsAuthenticated: boolean
) => {
  if (confirmationRequired(requirements)) {
    return userIsAuthenticated
      ? 'missing-data:email-confirmation'
      : 'email:confirmation';
  }

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

export const confirmationRequired = (
  requirements: AuthenticationRequirements['requirements']
) => {
  return requirements.authentication.missing_user_attributes.includes(
    'confirmation'
  );
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

const requiredBuiltInFields = (
  requirements: AuthenticationRequirements['requirements']
) => {
  const missingAttributes = new Set(
    requirements.authentication.missing_user_attributes
  );

  const askFirstName = missingAttributes.has('first_name');
  const askLastName = missingAttributes.has('last_name');
  const askEmail = missingAttributes.has('email');
  const askPassword = missingAttributes.has('password');

  return askFirstName || askLastName || askEmail || askPassword;
};

export const handleSubmitEmail = async (
  email: string,
  getAuthenticationData: () => AuthenticationData,
  getRequirements: GetRequirements,
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
      setCurrentStep('email:confirmation');
    }

    if (action === 'token') {
      updateState({ flow: 'signin' });
      await getUserTokenUnconfirmed(email);

      const { requirements } = await getRequirements();
      const authenticationData = getAuthenticationData();
      const missingDataStep = checkMissingData(
        requirements,
        authenticationData,
        'signin',
        true
      );

      if (missingDataStep) {
        setCurrentStep(missingDataStep);
        return;
      }

      setCurrentStep('success');
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
  state: State
) => {
  if (ssoProvider === 'clave_unica') {
    // If clave unica, we always go straight to SSO login
    handleOnSSOClick(ssoProvider, getAuthenticationData(), true, state.flow);
  } else if (ssoProvider === 'franceconnect') {
    const { requirements } = await getRequirements();

    handleOnSSOClick(
      'franceconnect',
      getAuthenticationData(),
      requirements.verification,
      'signin'
    );
  } else {
    // If other SSO provider, it depends on the flow
    if (state.flow === 'signin') {
      handleOnSSOClick(ssoProvider, getAuthenticationData(), true, state.flow);
    } else {
      updateState({ ssoProvider });
      setCurrentStep('email:sso-policies');
    }
  }
};
