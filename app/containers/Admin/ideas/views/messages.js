/*
 * AdminPage.DashboardPage Messages
 *
 * This contains all the text for the AdminPage.DashboardPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  headerIndex: {
    id: 'app.containers.AdminPage.Ideas.Views.all.headerIndex',
    defaultMessage: 'All Ideas',
  },
  deleteButton: {
    id: 'app.containers.AdminPage.Ideas.Views.all.deleteButton',
    defaultMessage: 'Delete',
  },
  updateButton: {
    id: 'app.containers.AdminPage.Ideas.Views.all.updateButton',
    defaultMessage: 'Edit',
  },
  createButton: {
    id: 'app.containers.AdminPage.Ideas.Views.all.createButton',
    defaultMessage: 'New Idea',
  },
  publishButton: {
    id: 'app.containers.AdminPage.Ideas.Views.form.publishButton',
    defaultMessage: 'Publish Idea',
  },

  ideaLoadingMessage: {
    id: 'app.containers.AdminPage.Ideas.Views.edit.ideaLoadingMessage',
    defaultMessage: 'Loading Idea...',
  },
  ideaLoadingError: {
    id: 'app.containers.AdminPage.Ideas.Views.all.ideaLoadingError',
    defaultMessage: 'Idea not found!',
  },
  exportIdeas: {
    id: 'app.containers.AdminPage.IdeaDashboard.exportIdeas',
    defaultMessage: 'Export all ideas',
  },
  exportComments: {
    id: 'app.containers.AdminPage.IdeaDashboard.exportComments',
    defaultMessage: 'Export all comments',
  },
  processingDownload: {
    id: 'app.containers.AdminPage.Ideas.Views.all.processingDownload',
    defaultMessage: 'Processing...',
  },
  downloadError: {
    id: 'app.containers.AdminPage.Ideas.Views.all.downloadError',
    defaultMessage: 'Error while downloading. Please retry',
  },
});
