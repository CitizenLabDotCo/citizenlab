import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';

export const checkMissingData = (
  requirements: AuthenticationRequirements['requirements'],
  flow: 'signup' | 'signin'
) => {
  if (requiredBuiltInFields(requirements)) {
    return 'missing-data:built-in';
  }

  if (confirmationRequired(requirements)) {
    return 'missing-data:email-confirmation';
  }

  if (requirements.verification) {
    return 'missing-data:verification';
  }

  // In the sign up flow, we want to ask for all custom
  // fields not filled out.
  if (flow === 'signup' && askCustomFields(requirements)) {
    return 'missing-data:custom-fields';
  }

  // In the sign in flow, we only want to ask for required custom
  // fields.
  // TODO: this should be calculated on the BE instead
  if (flow === 'signin' && requiredCustomFields(requirements)) {
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
