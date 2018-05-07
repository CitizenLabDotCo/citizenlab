import { definePermissionRule } from '../permissions';
import { isAdmin, isProjectModerator } from '../roles';
import { IIdeaData } from 'services/ideas';
import { IUser } from 'services/users';
import { IProjectData } from 'services/projects';

const isAuthor = (idea: IIdeaData, user?: IUser) => {
  return user && idea.relationships.author.data && idea.relationships.author.data.id === user.data.id;
};

const isIdeaProjectModerator = (idea: IIdeaData, user?: IUser) => {
  return user && isProjectModerator(user, idea.relationships.project.data.id);
};

definePermissionRule('ideas', 'create', (_idea: IIdeaData, user: IUser, { project = null }: { project: IProjectData }) => {
  if (project) {
    return project.relationships.action_descriptor.data.posting.enabled || isAdmin(user);
  }
  return true;
});

definePermissionRule('ideas', 'edit', (idea: IIdeaData, user: IUser) => {
  return !!(isAuthor(idea, user) || isAdmin(user) || isIdeaProjectModerator(idea, user));
});

definePermissionRule('ideas', 'markAsSpam', () => {
  return true;
});
