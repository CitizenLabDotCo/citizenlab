import { IIdeas } from 'api/ideas/types';
import { IUser } from 'api/users/types';
import { UserFormData } from './typings';
import { ImportedIdeaMetadataResponse } from 'api/import_ideas/types';

export const getNextIdeaId = (ideaId: string, ideas: IIdeas) => {
  const numberOfIdeas = ideas.data.length;
  if (numberOfIdeas === 1) return null;

  const indexOfCurrentIdea = ideas.data.findIndex((idea) => ideaId === idea.id);
  const lastIndex = numberOfIdeas - 1;

  if (indexOfCurrentIdea === lastIndex) {
    return ideas.data[indexOfCurrentIdea - 1].id;
  } else {
    return ideas.data[indexOfCurrentIdea + 1].id;
  }
};

export const getUserFormValues = (
  ideaId: string | null,
  userFormStatePerIdea: Record<string, UserFormData>,
  author: IUser | undefined,
  ideaMetadata: ImportedIdeaMetadataResponse | undefined
): UserFormData | null => {
  if (!ideaId || !ideaMetadata) return null;

  const defaultUserFormValues = getUserFormDefaultValues(author, ideaMetadata);
  const changes = userFormStatePerIdea[ideaId];

  return {
    ...defaultUserFormValues,
    ...changes,
  };
};

const getUserFormDefaultValues = (
  author: IUser | undefined,
  ideaMetadata: ImportedIdeaMetadataResponse
): UserFormData => {
  const consent = ideaMetadata.data.attributes.user_consent;

  if (!author) {
    return {
      consent,
      newUser: undefined,
      email: undefined,
      first_name: undefined,
      last_name: undefined,
    };
  }

  const { email, first_name, last_name } = author.data.attributes;

  return {
    consent,
    newUser: ideaMetadata.data.attributes.user_created === true,
    email,
    first_name: first_name ?? undefined,
    last_name: last_name ?? undefined,
  };
};
