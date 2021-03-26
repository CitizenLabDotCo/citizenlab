import { defineMessages } from 'react-intl';

export default defineMessages({
  helmetTitle: {
    id: 'app.containers.AdminPage.ProjectDashboard.helmetTitle',
    defaultMessage: 'Admin - Projects dashboard',
  },
  helmetDescription: {
    id: 'app.containers.AdminPage.ProjectDashboard.helmetDescription',
    defaultMessage: 'List of projects on the platform',
  },
  xGroupsHaveAccess: {
    id: 'app.containers.AdminPage.ProjectEdit.xGroupsHaveAccess',
    defaultMessage:
      '{groupCount, plural, no {# groups can view} one {# group can view} other {# groups can view}}',
  },
  onlyAdminsCanView: {
    id: 'app.containers.AdminPage.ProjectEdit.onlyAdminsCanView',
    defaultMessage: 'Only admins can view',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.editButtonLabel',
    defaultMessage: 'Edit',
  },
});
