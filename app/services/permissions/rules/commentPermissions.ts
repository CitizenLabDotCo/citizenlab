import { definePermissionRule } from '../permissions';
import { isAdmin } from '../roles';
import { ICommentData } from 'services/comments';
import { IUser } from 'services/users';

const isAuthor = (comment: ICommentData, user?: IUser) => {
  return user && comment.relationships.author.data && comment.relationships.author.data.id === user.data.id;
};

definePermissionRule('comments', 'create', (comment: ICommentData, user: IUser) => {
  return !!user;
});

definePermissionRule('comments', 'edit', (comment: ICommentData, user: IUser) => {
  return !!(isAuthor(comment, user) || isAdmin(user));
});

definePermissionRule('comments', 'markAsSpam', (comment: ICommentData, user: IUser) => {
  return true;
});
