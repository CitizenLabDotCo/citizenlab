import { ICommentData } from 'api/comments/types';
import { IUser } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin, isProjectModerator } from '../roles';

const isAuthor = (comment: ICommentData, user: IUser) => {
  return comment.relationships.author.data?.id === user.data.id;
};

definePermissionRule(
  'comment',
  'create',
  (_comment: ICommentData, user: IUser | undefined) => {
    return !!user;
  }
);

definePermissionRule(
  'comment',
  'edit',
  (comment: ICommentData, user: IUser | undefined) => {
    return user ? isAuthor(comment, user) : false;
  }
);

definePermissionRule(
  'comment',
  'delete',
  (comment: ICommentData, user: IUser | undefined, _tenant, { projectId }) => {
    if (user) {
      return (
        isAuthor(comment, user) ||
        isAdmin(user) ||
        isProjectModerator(user, projectId)
      );
    }

    return false;
  }
);

definePermissionRule(
  'comment',
  'justifyDeletion',
  (comment: ICommentData, user: IUser | undefined, _tenant, { projectId }) => {
    if (user) {
      return (
        !isAuthor(comment, user) &&
        (isAdmin(user) || isProjectModerator(user, projectId))
      );
    }

    return false;
  }
);

definePermissionRule(
  'comment',
  'markAsSpam',
  (comment: ICommentData, user: IUser | undefined, _tenant, { projectId }) => {
    if (user) {
      return !(
        isAuthor(comment, user) ||
        isAdmin(user) ||
        isProjectModerator(user, projectId)
      );
    }

    return false;
  }
);
