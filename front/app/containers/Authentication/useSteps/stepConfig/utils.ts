import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';

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

export const askCustomFields = (
  requirements: AuthenticationRequirements['requirements']
) => {
  const { custom_fields } = requirements;
  return Object.keys(custom_fields).length > 0;
};

export const requiredCustomFields = (
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

export const requiredBuiltInFields = (
  requirements: AuthenticationRequirements['requirements']
) => {
  const missingAttributes = new Set(
    requirements.authentication.missing_user_attributes
  );

  const askFirstName = missingAttributes.has('first_name');
  const askLastName = missingAttributes.has('last_name');
  const askPassword = missingAttributes.has('password');

  return askFirstName || askLastName || askPassword;
};

export const doesNotMeetGroupCriteria = (
  requirements: AuthenticationRequirements['requirements']
) => {
  return requirements.group_membership;
};
