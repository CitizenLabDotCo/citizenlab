import { defineMessages } from 'react-intl';

export default defineMessages({
  overviewPageTitle: {
    id: 'app.containers.AdminPage.ProjectDashboard.overviewPageTitle',
    defaultMessage: 'Projects',
  },
  overviewPageSubtitle: {
    id: 'app.containers.AdminPage.ProjectDashboard.overviewPageSubtitle',
    defaultMessage:
      'Create as many projects as you want and edit them at any time. Drag and drop them to change the order in which you want to see them on your homepage.',
  },
  newProject: {
    id: 'app.containers.AdminPage.ProjectEdit.createProject',
    defaultMessage: 'New project',
  },
  published: {
    id: 'app.containers.AdminPage.ProjectDashboard.published',
    defaultMessage: 'Published',
  },
  draft: {
    id: 'app.containers.AdminPage.ProjectEdit.draft',
    defaultMessage: 'Draft',
  },
  archived: {
    id: 'app.containers.AdminPage.ProjectEdit.archived',
    defaultMessage: 'Archived',
  },
  createAProjectFromATemplate: {
    id: 'app.containers.AdminPage.ProjectEdit.createAProjectFromATemplate',
    defaultMessage: 'Create a project from a template',
  },
  existingProjects: {
    id: 'app.containers.AdminPage.projects.all.existingProjects',
    defaultMessage: 'Existing projects',
  },
  projectsAndFolders: {
    id: 'app.containers.AdminPage.projects.all.projectsAndFolders',
    defaultMessage: 'Projects and folders',
  },
  createProjectFolder: {
    id: 'app.containers.AdminPage.projects.all.createProjectFolder',
    defaultMessage: 'New folder',
  },
  onlyAdminsCanCreateFolders: {
    id: 'app.containers.AdminPage.projects.all.onlyAdminsCanCreateFolders',
    defaultMessage: 'Only admins can create project folders.',
  },
  onlyAdminsCanCreateProjects: {
    id: 'app.containers.AdminPage.projects.all.onlyAdminsCanCreateProjects',
    defaultMessage: 'Only admins and folder moderators can create projects.',
  },
});
