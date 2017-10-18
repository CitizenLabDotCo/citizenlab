import { defineMessages } from 'react-intl';

export default defineMessages({
  permissionsTitle: {
    id: 'app.containers.admin.project.permissions.permissionsTitle',
    defaultMessage: 'Access',
  },
  permissionsSubtitle: {
    id: 'app.containers.admin.project.permissions.permissionsSubtitle',
    defaultMessage: 'People that can access this project',
  },
  permissionTypeLabel: {
    id: 'app.containers.admin.project.permissions.permissionTypeLabel',
    defaultMessage: 'Who can view this project?',
  },
  permissionsEveryoneLabel: {
    id: 'app.containers.admin.project.permissions.permissionsEveryoneLabel',
    defaultMessage: 'Everyone',
  },
  permissionsSelectionLabel: {
    id: 'app.containers.admin.project.permissions.permissionsSelectionLabel',
    defaultMessage: 'Selection',
  },
  noSelectedGroupsMessage: {
    id: 'app.containers.AdminPage.groups.list.emptyListMessage',
    defaultMessage: 'You don’t have any group of users yet.',
  },
});
