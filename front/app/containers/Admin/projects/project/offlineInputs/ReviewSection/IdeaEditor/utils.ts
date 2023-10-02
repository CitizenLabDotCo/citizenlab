import { IIdeas } from 'api/ideas/types';
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

export const getUserFormValues = (user: IUser): UserFormData | null => {
  const { email, first_name, last_name } = user.data.attributes;
  if (!email) return null;

  return {
    newUser: true, // TODO
    email,
    first_name: first_name ?? undefined,
    last_name: last_name ?? undefined,
  };
};
