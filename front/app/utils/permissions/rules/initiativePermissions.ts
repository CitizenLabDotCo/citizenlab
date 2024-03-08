import { IInitiativeData } from 'api/initiatives/types';
import { IUser } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin } from '../roles';

const isAuthor = (initiative: IInitiativeData, user: IUser) => {
  return initiative.relationships.author.data?.id === user.data.id;
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
  (initiative: IInitiativeData, user: IUser | undefined) => {
    if (user) {
      return isAuthor(initiative, user) || isAdmin(user);
    }

    return false;
  }
);

definePermissionRule('initiative', 'markAsSpam', () => {
  return true;
});

definePermissionRule(
  'initiative',
  'moderate',
  (_initiative: IInitiativeData, user: IUser | undefined) => {
    return user ? isAdmin(user) : false;
  }
);
