import { definePermissionRule } from '../permissions';
import { isAdmin } from '../roles';
import { ICommentData } from 'services/comments';
import { IUser } from 'services/users';

const isAuthor = (idea: ICommentData, user?: IUser) => {
  return user && idea.relationships.author.data && idea.relationships.author.data.id === user.data.id;
};

definePermissionRule('comments', 'create', (idea: ICommentData, user: IUser) => {
  return !!user;
});

definePermissionRule('comments', 'edit', (idea: ICommentData, user: IUser) => {
  return !!(isAuthor(idea, user) || isAdmin(user));
});

definePermissionRule('comments', 'markAsSpam', (idea: ICommentData, user: IUser) => {
  return true;
});
