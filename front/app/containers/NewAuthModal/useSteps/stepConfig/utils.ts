import { AuthenticationRequirements } from 'api/authentication_requirements/types';

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
