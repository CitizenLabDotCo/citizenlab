import { defineMessages } from 'react-intl';

export default defineMessages({
  titlePlaceholder: {
    id: 'app.containers.Admin.projects.NewProjectForm.titlePlaceholder',
    defaultMessage: 'Add a project title',
  },
  titleRequired: {
    id: 'app.containers.Admin.projects.NewProjectForm.titleRequired',
    defaultMessage: 'Add a project title in every language.',
  },
  context: {
    id: 'app.containers.Admin.projects.NewProjectForm.context',
    defaultMessage: 'Context',
  },
  chooseGroups: {
    id: 'app.containers.Admin.projects.NewProjectForm.chooseGroups',
    defaultMessage: 'Choose groups',
  },
  searchGroups: {
    id: 'app.containers.Admin.projects.NewProjectForm.searchGroups',
    defaultMessage: 'Search groups',
  },
  noGroupsMatch: {
    id: 'app.containers.Admin.projects.NewProjectForm.noGroupsMatch',
    defaultMessage: 'No groups match your search.',
  },
  groupsRequired: {
    id: 'app.containers.Admin.projects.NewProjectForm.groupsRequired',
    defaultMessage: 'Choose at least one group.',
  },
  createError: {
    id: 'app.containers.Admin.projects.NewProjectForm.createError',
    defaultMessage: 'Something went wrong. Please try again.',
  },
});
