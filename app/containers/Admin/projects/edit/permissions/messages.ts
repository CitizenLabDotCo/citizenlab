import { defineMessages } from 'react-intl';

export default defineMessages({
  editButtonLabel: {
    id: 'app.containers.AdminPage.groups.permissions.editButtonLabel',
    defaultMessage: 'Edit',
  },
  inputAssignmentSectionTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.inputAssignmentSectionTitle',
    defaultMessage: 'Who is responsible for processing the inputs?',
  },
  inputAssignmentTooltipText: {
    id: 'app.containers.AdminPage.ProjectEdit.inputAssignmentTooltipText',
    defaultMessage:
      'All new inputs in this project will be assigned to this person. The assignee can be changed in the {ideaManagerLink}.',
  },
  inputManagerLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.inputManagerLinkText',
    defaultMessage: 'input manager',
  },
  unassigned: {
    id: 'app.containers.AdminPage.ProjectEdit.unassigned',
    defaultMessage: 'Unassigned',
  },
  participationAccessRightsTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.participationAccessRightsTitle',
    defaultMessage: 'Participation',
  },
  moderationRightsTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.moderationRightsTitle',
    defaultMessage: 'Moderation',
  },
  permissionsEveryoneLabel: {
    id: 'app.containers.admin.project.permissions.permissionsEveryoneLabel',
    defaultMessage: 'Everyone',
  },
  permissionsAdministrators: {
    id: 'app.containers.admin.project.permissions.permissionsAdministrators',
    defaultMessage: 'Administrators',
  },
  permissionsSelectionLabel: {
    id: 'app.containers.admin.project.permissions.permissionsSelectionLabel',
    defaultMessage: 'Selection',
  },
});
