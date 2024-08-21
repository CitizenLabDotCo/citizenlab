import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';

export const checkMissingData = (
  requirements: AuthenticationRequirements['requirements']
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

  if (askCustomFields(requirements)) {
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
