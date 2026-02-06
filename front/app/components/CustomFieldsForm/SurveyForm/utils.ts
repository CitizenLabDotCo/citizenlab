import { IIdea } from 'api/ideas/types';
import { IPhase } from 'api/phases/types';
import { IUser } from 'api/users/types';

import { addPrefix } from '../util';

export const getInitialData = (
  draftIdea: IIdea | undefined,
  authUser: IUser | undefined,
  phase: IPhase
) => {
  const initialFormData = draftIdea?.data.attributes ?? {};
  const customFieldValues = authUser?.data.attributes.custom_field_values;

  if (phase.data.attributes.user_fields_in_form_enabled && customFieldValues) {
    return {
      ...initialFormData,
      ...addPrefix(customFieldValues),
    };
  }

  return initialFormData;
};
