import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.Admin.pagesAndMenu.containers.AddProjectModal.modalTitle',
    defaultMessage: 'Add project or folder',
  },
  titleProjectOnly: {
    id: 'app.containers.Admin.pagesAndMenu.containers.AddProjectModal.modalTitleProjectOnly',
    defaultMessage: 'Add project',
  },
  emptyNameError: {
    id: 'app.containers.Admin.pagesAndMenu.containers.AddProjectModal.emptyNameErrorText',
    defaultMessage: 'Provide a name for all languages',
  },
  navbarItemName: {
    id: 'app.containers.Admin.pagesAndMenu.containers.AddProjectModal.navbarItemName',
    defaultMessage: 'Name',
  },
  savePage: {
    id: 'app.containers.Admin.pagesAndMenu.containers.AddProjectModal.savePage',
    defaultMessage: 'Save',
  },
  emptyProjectError: {
    id: 'app.containers.Admin.pagesAndMenu.containers.AddProjectModal.emptyProjectError',
    defaultMessage: 'The project cannot be empty',
  },
  emptyProjectOrFolderError: {
    id: 'app.containers.Admin.pagesAndMenu.containers.AddProjectModal.emptyProjectOrFolderError',
    defaultMessage: 'The project or folder cannot be empty',
  },
  warning: {
    id: 'app.containers.Admin.pagesAndMenu.containers.AddProjectModal.accessWarning',
    defaultMessage:
      'The navigation bar will only show projects or folders the user can access.',
  },
  warningProjectOnly: {
    id: 'app.containers.Admin.pagesAndMenu.containers.AddProjectModal.accessWarningProjectOnly',
    defaultMessage:
      'The navigation bar will only show projects to which users have access.',
  },
  resultingUrl: {
    id: 'app.containers.Admin.pagesAndMenu.containers.AddProjectModal.resultingUrl',
    defaultMessage: 'Resulting URL',
  },
  project: {
    id: 'app.containers.Admin.pagesAndMenu.containers.AddProjectModal.project',
    defaultMessage: 'Project',
  },
  projectOrFolder: {
    id: 'app.containers.Admin.pagesAndMenu.containers.AddProjectModal.projectOrFolder',
    defaultMessage: 'Project or folder',
  },
});
