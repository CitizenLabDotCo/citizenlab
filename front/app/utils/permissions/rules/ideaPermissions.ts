import { IIdeaData } from 'api/ideas/types';
import { IUser } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin, isProjectModerator } from '../roles';

const isAuthor = (idea: IIdeaData, user: IUser) => {
  return idea.relationships.author?.data?.id === user.data.id;
};

const isIdeaProjectModerator = (idea: IIdeaData, user: IUser) => {
  return isProjectModerator(user, idea.relationships.project.data.id);
};

definePermissionRule(
  'idea',
  'create',
  (_idea: IIdeaData, user: IUser | undefined, _tenant, { project = null }) => {
    if (project) {
      return (
        project.attributes.action_descriptor.posting_idea.enabled ||
        (user && isAdmin(user))
      );
    }

    return true;
  }
);

definePermissionRule(
  'idea',
  'edit',
  (idea: IIdeaData, user: IUser | undefined) => {
    if (user) {
      return (
        isAuthor(idea, user) ||
        isAdmin(user) ||
        isIdeaProjectModerator(idea, user)
      );
    }

    return false;
  }
);

definePermissionRule('idea', 'markAsSpam', () => {
  return true;
});

definePermissionRule(
  'idea',
  'assignBudget',
  (idea: IIdeaData | null, user: IUser | undefined, _tenant, { projectId }) => {
    if (user) {
      return isAdmin(user) || (!!idea && isProjectModerator(user, projectId));
    }

    return false;
  }
);
