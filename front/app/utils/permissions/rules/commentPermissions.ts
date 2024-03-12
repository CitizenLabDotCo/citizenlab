import { ICommentData } from 'api/comments/types';
import { IUser } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin, isProjectModerator } from '../roles';

const isAuthor = (comment: ICommentData, user?: IUser) => {
  return (
    user &&
    comment.relationships.author.data &&
    comment.relationships.author.data.id === user.data.id
  );
};

definePermissionRule('comment', 'create', (_comment: ICommentData, user) => {
  return !!user;
});

definePermissionRule('comment', 'edit', (comment: ICommentData, user) => {
  return !!isAuthor(comment, user);
});

definePermissionRule(
  'comment',
  'delete',
  (comment: ICommentData, user, _tenant, { projectId }) => {
    return !!(
      isAuthor(comment, user) ||
      isAdmin(user) ||
      isProjectModerator(user, projectId)
    );
  }
);

definePermissionRule(
  'comment',
  'justifyDeletion',
  (comment: ICommentData, user, _tenant, { projectId }) => {
    return (
      !isAuthor(comment, user) &&
      (isAdmin(user) || isProjectModerator(user, projectId))
    );
  }
);

definePermissionRule(
  'comment',
  'markAsSpam',
  (comment: ICommentData, user, _tenant, { projectId }) => {
    return user
      ? !(
          isAuthor(comment, user) ||
          isAdmin(user) ||
          (typeof projectId === 'string' && isProjectModerator(user, projectId))
        )
      : false;
  }
);
