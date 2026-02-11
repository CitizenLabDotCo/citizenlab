import { IIdeaData } from 'api/ideas/types';
import { IPhase } from 'api/phases/types';
import { IUser } from 'api/users/types';

import { addPrefix } from '../util';

export const getInitialData = (
  idea: IIdeaData | undefined,
  authUser: IUser | undefined,
  phase: IPhase | undefined
) => {
  const initialFormData = idea
    ? {
        ...idea.attributes,
        author_id: idea.relationships.author?.data?.id,
        cosponsor_ids: idea.relationships.cosponsors?.data?.map(
          (cosponsor) => cosponsor.id
        ),
        topic_ids: idea.relationships.input_topics?.data.map(
          (topic) => topic.id
        ),
      }
    : {};

  const customFieldValues = authUser?.data.attributes.custom_field_values;

  if (phase?.data.attributes.user_fields_in_form_enabled && customFieldValues) {
    return {
      ...initialFormData,
      ...addPrefix(customFieldValues),
    };
  }

  return initialFormData;
};
