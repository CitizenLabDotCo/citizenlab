import { defineMessages } from 'react-intl';

export default defineMessages({
  pageTitle: {
    id: 'app.containers.Admin.PagesAndMenu.containers.ProjectsList.pageTitle',
    defaultMessage: 'Projects list',
  },
  pageMetaTitle: {
    id: 'app.containers.Admin.PagesAndMenu.containers.ProjectsList.pageMetaTitle',
    defaultMessage: 'Projects list | {orgName}',
  },
  sectionDescription: {
    id: 'app.containers.Admin.PagesAndMenu.containers.ProjectsList.sectionDescription',
    defaultMessage:
      'The following projects will be shown on this page based on your {pageSettingsLink}.',
  },
  pageSettingsLinkText: {
    id: 'app.containers.Admin.PagesAndMenu.containers.ProjectsList.pageSettingsLinkText',
    defaultMessage: 'page settings',
  },
  editProject: {
    id: 'app.containers.Admin.PagesAndMenu.containers.ProjectsList.editProject',
    defaultMessage: 'Edit',
  },
  noAvailableProjects: {
    id: 'app.containers.Admin.PagesAndMenu.containers.ProjectsList.noAvailableProjects',
    defaultMessage: 'No available projects based on your {pageSettingsLink}.',
  },
  noFilter: {
    id: 'app.containers.Admin.PagesAndMenu.containers.ProjectsList.noAvailableProjects',
    defaultMessage:
      'This project has no tag or area filter, so no projects will be displayed.',
  },
});
