import { IIdeaData } from 'api/ideas/types';
import { IUser } from 'api/users/types';

import { definePermissionRule } from 'utils/permissions/permissions';

import { isAdmin, isProjectModerator } from '../roles';

const isAuthor = (idea: IIdeaData, user: IUser | undefined) => {
  return (
    user &&
    idea.relationships.author?.data &&
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    idea.relationships.author?.data.id === user.data.id
  );
};

const isIdeaProjectModerator = (idea: IIdeaData, user: IUser | undefined) => {
  return user && isProjectModerator(user, idea.relationships.project.data.id);
};

definePermissionRule(
  'idea',
  'create',
  (_idea: IIdeaData, user, _tenant, { project = null }) => {
    if (project) {
      return (
        project.attributes.action_descriptors.posting_idea.enabled ||
        isAdmin(user)
      );
    }

    return true;
  }
);

definePermissionRule('idea', 'edit', (idea: IIdeaData, user) => {
  const userCanEditIdea = !!(
    isAuthor(idea, user) ||
    isAdmin(user) ||
    isIdeaProjectModerator(idea, user)
  );
  return (
    userCanEditIdea && idea.attributes.action_descriptors.editing_idea.enabled
  );
});

definePermissionRule('idea', 'markAsSpam', () => {
  return true;
});

definePermissionRule(
  'idea',
  'assignBudget',
  (idea: IIdeaData | null, user, _tenant, { projectId }) => {
    return !!isAdmin(user) || (!!idea && !!isProjectModerator(user, projectId));
  }
);
