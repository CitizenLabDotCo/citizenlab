import { IIdea } from 'api/ideas/types';
import { IPhase } from 'api/phases/types';
import { IUser } from 'api/users/types';

export const getInitialData = (
  draftIdea: IIdea | undefined,
  authUser: IUser | undefined,
  phase: IPhase
) => {
  const initialFormData = draftIdea?.data.attributes ?? {};

  if (phase.data.attributes.user_fields_in_form_enabled && authUser) {
    return {
      ...initialFormData,
      ...authUser.data.attributes.custom_field_values,
    };
  }

  return initialFormData;
};
