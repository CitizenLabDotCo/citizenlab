/*
 * AdminPage.DashboardPage Messages
 *
 * This contains all the text for the AdminPage.DashboardPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  headerIndex: {
    id: 'app.containers.AdminPage.Projects.Views.all.headerIndex',
    defaultMessage: 'All Projects',
  },
  deleteButton: {
    id: 'app.containers.AdminPage.Projects.Views.all.deleteButton',
    defaultMessage: 'Delete',
  },
  updateButton: {
    id: 'app.containers.AdminPage.Projects.Views.all.updateButton',
    defaultMessage: 'Edit',
  },
  createButton: {
    id: 'app.containers.AdminPage.Projects.Views.all.createButton',
    defaultMessage: 'New Project',
  },
  publishButton: {
    id: 'app.containers.AdminPage.Projects.Views.form.publishButton',
    defaultMessage: 'Publish Project',
  },

  projectLoadingMessage: {
    id: 'app.containers.AdminPage.Projects.Views.edit.projectLoadingMessage',
    defaultMessage: 'Loading Project...',
  },
  projectLoadingError: {
    id: 'app.containers.AdminPage.Projects.Views.edit.projectLoadingError',
    defaultMessage: 'Project not found!',
  },
  tableTitle: {
    id: 'app.containers.AdminPage.AreaDashboard.tableTitle',
    defaultMessage: 'Projects',
  },
});
