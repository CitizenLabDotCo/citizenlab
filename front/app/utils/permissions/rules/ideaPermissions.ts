import { definePermissionRule } from 'utils/permissions/permissions';
import { isAdmin, isProjectModerator } from '../roles';
import { IIdeaData } from 'api/ideas/types';
import { IUser } from 'api/users/types';

const isAuthor = (idea: IIdeaData, user?: IUser) => {
  return (
    user &&
    idea.relationships.author?.data &&
    idea.relationships.author?.data.id === user.data.id
  );
};

const isIdeaProjectModerator = (idea: IIdeaData, user?: IUser) => {
  return user && isProjectModerator(user, idea.relationships.project.data.id);
};

definePermissionRule(
  'idea',
  'create',
  (_idea: IIdeaData, user: IUser, _tenant, { project = null }) => {
    if (project) {
      return (
        project.attributes.action_descriptor.posting_idea.enabled ||
        isAdmin(user)
      );
    }

    return true;
  }
);

definePermissionRule('idea', 'edit', (idea: IIdeaData, user: IUser) => {
  return !!(
    isAuthor(idea, user) ||
    isAdmin(user) ||
    isIdeaProjectModerator(idea, user)
  );
});

definePermissionRule('idea', 'markAsSpam', () => {
  return true;
});

definePermissionRule(
  'idea',
  'assignBudget',
  (idea: IIdeaData | null, user: IUser, _tenant, { projectId }) => {
    return !!isAdmin(user) || (!!idea && !!isProjectModerator(user, projectId));
  }
);
