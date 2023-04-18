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
  builtInFieldRequirements: AuthenticationRequirements['requirements']['built_in']
) => {
  for (const fieldName in builtInFieldRequirements) {
    if (builtInFieldRequirements[fieldName] === 'required') {
      return true;
    }
  }

  return false;
};
