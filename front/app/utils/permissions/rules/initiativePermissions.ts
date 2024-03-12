import { IInitiativeData } from 'api/initiatives/types';
import { IUser } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin } from '../roles';

const isAuthor = (initiative: IInitiativeData, user: IUser | undefined) => {
  return (
    user &&
    initiative.relationships.author.data &&
    initiative.relationships.author.data.id === user.data.id
  );
};

export const canCommentOnInitiative = (user: IUser) => {
  return !isAdmin(user);
};

export const canModerateInitiative = (user: IUser) => {
  return isAdmin(user);
};

definePermissionRule(
  'initiative',
  'edit',
  (initiative: IInitiativeData, user) => {
    return !!(isAuthor(initiative, user) || isAdmin(user));
  }
);

definePermissionRule('initiative', 'markAsSpam', () => {
  return true;
});

definePermissionRule(
  'initiative',
  'moderate',
  (_initiative: IInitiativeData, user) => {
    return isAdmin(user);
  }
);
