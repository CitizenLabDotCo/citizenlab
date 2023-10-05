import { IIdeas } from 'api/ideas/types';
import { IUser } from 'api/users/types';
import { UserFormData } from './typings';
import { ImportedIdeaMetadataResponse } from 'api/import_ideas/types';
import { isValidEmail } from 'utils/validate';

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
      userState: 'invalid-email',
      first_name: undefined,
      last_name: undefined,
      email: undefined,
      consent,
    };
  }

  const { email, first_name, last_name } = author.data.attributes;

  const validEmail = email ? isValidEmail(email) : false;

  return {
    userState: !validEmail
      ? 'invalid-email'
      : ideaMetadata.data.attributes.user_created === true
      ? 'new-user'
      : 'existing-user',
    first_name: first_name ?? undefined,
    last_name: last_name ?? undefined,
    email,
    consent,
  };
};

export const isUserFormDataValid = (userFormData: UserFormData | null) => {
  if (!userFormData) return false;
  if (!userFormData.consent) return true;

  if (['no-user', 'invalid-email'].includes(userFormData.userState)) {
    return false;
  }

  const { email } = userFormData;
  const validEmail = email ? isValidEmail(email) : false;

  if (!validEmail) return false;

  return true;
};
