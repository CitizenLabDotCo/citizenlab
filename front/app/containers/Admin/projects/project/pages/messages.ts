import { defineMessages } from 'react-intl';

export default defineMessages({
  pagesTitle: {
    id: 'app.containers.AdminPage.ProjectPages.pagesTitle2',
    defaultMessage: 'Project pages',
  },
  pagesDescription: {
    id: 'app.containers.AdminPage.ProjectPages.pagesDescription3',
    defaultMessage:
      'Add a page to share background on the consultation, an FAQ, or how the process works. You can link to these pages in the project description using the Page Link widget. Project pages are scoped only to this project and cannot be added to the navigation bar.',
  },
  newPageButton: {
    id: 'app.containers.AdminPage.ProjectPages.newPageButton3',
    defaultMessage: 'Add a project page',
  },
  noPagesTitle: {
    id: 'app.containers.AdminPage.ProjectPages.noPagesTitle2',
    defaultMessage: 'No project pages yet',
  },
  addFirstPage: {
    id: 'app.containers.AdminPage.ProjectPages.addFirstPage',
    defaultMessage: 'Add your first project page',
  },
  editButton: {
    id: 'app.containers.AdminPage.ProjectPages.editButton',
    defaultMessage: 'Edit',
  },
  deleteButton: {
    id: 'app.containers.AdminPage.ProjectPages.deleteButton',
    defaultMessage: 'Delete',
  },
  deleteConfirmation: {
    id: 'app.containers.AdminPage.ProjectPages.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete this page?',
  },
  newPageTitle: {
    id: 'app.containers.AdminPage.ProjectPages.newPageTitle',
    defaultMessage: 'New page',
  },
  titleLabel: {
    id: 'app.containers.AdminPage.ProjectPages.titleLabel',
    defaultMessage: 'Title',
  },
  contentLabel: {
    id: 'app.containers.AdminPage.ProjectPages.contentLabel',
    defaultMessage: 'Content',
  },
  attachmentsLabel: {
    id: 'app.containers.AdminPage.ProjectPages.attachmentsLabel',
    defaultMessage: 'Attachments',
  },
  createButton: {
    id: 'app.containers.AdminPage.ProjectPages.createButton',
    defaultMessage: 'Create page',
  },
  saveButton: {
    id: 'app.containers.AdminPage.ProjectPages.saveButton',
    defaultMessage: 'Save',
  },
  saveSuccess: {
    id: 'app.containers.AdminPage.ProjectPages.saveSuccess',
    defaultMessage: 'Page saved',
  },
  viewPage: {
    id: 'app.containers.AdminPage.ProjectPages.viewPage',
    defaultMessage: 'View page',
  },
  titleError: {
    id: 'app.containers.AdminPage.ProjectPages.titleError',
    defaultMessage: 'Provide a title for all languages',
  },
  slugRegexError: {
    id: 'app.containers.AdminPage.ProjectPages.slugRegexError',
    defaultMessage:
      'The slug can only contain regular, lowercase letters (a-z), numbers (0-9) and hyphens (-). The first and last characters cannot be hyphens. Consecutive hyphens (--) are prohibited.',
  },
  slugRequiredError: {
    id: 'app.containers.AdminPage.ProjectPages.slugRequiredError',
    defaultMessage: 'Provide a slug',
  },
});
