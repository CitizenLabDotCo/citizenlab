import { definePermissionRule } from 'services/permissions/permissions';
import { isAdmin } from '../roles';
import { IInitiativeData } from 'services/initiatives';
import { IUser } from 'services/users';

const isAuthor = (initiative: IInitiativeData, user?: IUser) => {
  return user && initiative.relationships.author.data && initiative.relationships.author.data.id === user.data.id;
};

export const canCommentOnInitiative = (user: IUser) => {
  return !isAdmin(user);
};

definePermissionRule('initiatives', 'edit', (initiative: IInitiativeData, user: IUser) => {
  return !!(isAuthor(initiative, user) || isAdmin(user));
});

definePermissionRule('initiatives', 'markAsSpam', () => {
  return true;
});

definePermissionRule('initiatives', 'moderate', (_initiative: IInitiativeData, user: IUser) => {
  return isAdmin(user);
});
