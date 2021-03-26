import { definePermissionRule } from 'services/permissions/permissions';
import { isAdmin } from '../roles';
import { IInitiativeData } from 'services/initiatives';
import { IUser } from 'services/users';

const isAuthor = (initiative: IInitiativeData, user?: IUser) => {
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
  (initiative: IInitiativeData, user: IUser) => {
    return !!(isAuthor(initiative, user) || isAdmin(user));
  }
);

definePermissionRule('initiative', 'markAsSpam', () => {
  return true;
});

definePermissionRule(
  'initiative',
  'moderate',
  (_initiative: IInitiativeData, user: IUser) => {
    return isAdmin(user);
  }
);
