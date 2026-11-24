import { isEqual } from 'lodash-es';

import { IIdeas } from 'api/ideas/types';
import { ImportedIdeaMetadataResponse } from 'api/import_ideas/types';
import { IUser } from 'api/users/types';

import { UserFormData } from './typings';

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

  const initialUserFormValues = getInitialUserFormValues(author, ideaMetadata);
  const changes = userFormStatePerIdea[ideaId];

  return {
    ...initialUserFormValues,
    ...changes,
  };
};

const getInitialUserFormValues = (
  author: IUser | undefined,
  ideaMetadata: ImportedIdeaMetadataResponse
): UserFormData => {
  const consent = ideaMetadata.data.attributes.user_consent;
  const userCreated = ideaMetadata.data.attributes.user_created;

  if (!author) {
    return {
      user_state: 'no-user',
      first_name: undefined,
      last_name: undefined,
      email: undefined,
      consent,
    };
  }

  const { email, first_name, last_name, no_name } = author.data.attributes;

  return {
    user_state: userCreated ? 'new-imported-user' : 'existing-user',
    first_name: no_name ? undefined : first_name ?? undefined,
    last_name: no_name ? undefined : last_name ?? undefined,
    email,
    consent,
  };
};

export const isUserFormDataValid = (userFormData: UserFormData | null) => {
  if (!userFormData) return false;
  if (!userFormData.consent) return true;

  const { email, first_name, last_name } = userFormData;

  return !!email || !!(first_name && last_name);
};

type UserFormDataAction =
  | 'do-nothing'
  | 'create-new-user-and-assign-to-idea'
  | 'assign-existing-user-to-idea'
  | 'update-created-user'
  | 'remove-assigned-user';

export const getUserFormDataAction = (
  userFormData: UserFormData,
  author: IUser | undefined,
  ideaMetadata: ImportedIdeaMetadataResponse
): UserFormDataAction => {
  const initialFormData = getInitialUserFormValues(author, ideaMetadata);

  if (isEqual(initialFormData, userFormData)) return 'do-nothing';

  if (!userFormData.consent) {
    return initialFormData.consent ? 'remove-assigned-user' : 'do-nothing';
  }

  if (userFormData.user_state === 'new-imported-user') {
    return initialFormData.user_state === 'new-imported-user'
      ? 'update-created-user'
      : 'create-new-user-and-assign-to-idea';
  }

  if (userFormData.user_state === 'existing-user') {
    return 'assign-existing-user-to-idea';
  }

  return 'do-nothing';
};

export const getUserChanges = (
  { email, first_name, last_name }: UserFormData,
  author: IUser,
  ideaMetadata: ImportedIdeaMetadataResponse
) => {
  const initialFormData = getInitialUserFormValues(author, ideaMetadata);

  const userChanges = {
    ...(email === initialFormData.email ? {} : { email }),
    ...(first_name === initialFormData.first_name ? {} : { first_name }),
    ...(last_name === initialFormData.last_name ? {} : { last_name }),
  };

  return userChanges;
};
