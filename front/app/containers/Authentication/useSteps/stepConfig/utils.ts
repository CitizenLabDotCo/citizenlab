import { AuthenticationRequirements } from 'api/authentication/authentication_requirements/types';

export const askCustomFields = (
  customFieldRequirements: AuthenticationRequirements['requirements']['custom_fields']
) => {
  for (const fieldName in customFieldRequirements) {
    if (
      customFieldRequirements[fieldName] === 'ask' ||
      customFieldRequirements[fieldName] === 'require'
    ) {
      return true;
    }
  }

  return false;
};

export const requiredCustomFields = (
  customFieldRequirements: AuthenticationRequirements['requirements']['custom_fields']
) => {
  for (const fieldName in customFieldRequirements) {
    if (customFieldRequirements[fieldName] === 'require') {
      return true;
    }
  }

  return false;
};

export const requiredBuiltInFields = (
  requirements: AuthenticationRequirements['requirements']
) => {
  const builtIn = requirements.built_in;

  const askFirstName = builtIn.first_name === 'require';
  const askLastName = builtIn.last_name === 'require';
  const askPassword = requirements.special.password === 'require';

  return askFirstName || askLastName || askPassword;
};
