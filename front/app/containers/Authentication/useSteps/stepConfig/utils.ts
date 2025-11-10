import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';

import { AuthenticationData } from 'containers/Authentication/typings';

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
