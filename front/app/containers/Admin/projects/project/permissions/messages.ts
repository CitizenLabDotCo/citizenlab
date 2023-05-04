import { defineMessages } from 'react-intl';

export default defineMessages({
  permissionsAnyoneLabel: {
    id: 'app.containers.admin.project.permissions.permissionsAnyoneLabel',
    defaultMessage: 'Anyone',
  },
  permissionsAnyoneLabelDescription: {
    id: 'app.containers.admin.project.permissions.permissionsAnyoneLabelDescription',
    defaultMessage: 'Anyone including unregistered users can participate.',
  },
  permissionsEmailConfirmLabel: {
    id: 'app.containers.admin.project.permissions.permissionsEmailConfirmLabel',
    defaultMessage: 'Users with confirmed email',
  },
  permissionsEmailConfirmLabelDescription: {
    id: 'app.containers.admin.project.permissions.permissionsEmailConfirmLabelDescription',
    defaultMessage:
      'Anyone can participate after submitting and confirming their email address.',
  },
  permissionsAdministrators: {
    id: 'app.containers.admin.project.permissions.permissionsAdministrators',
    defaultMessage: 'Administrators',
  },
  permissionsAdminsAndCollaborators: {
    id: 'app.containers.admin.project.permissions.permissionsAdminsAndCollaborators',
    defaultMessage: 'Admins and collaborators only',
  },
  permissionsAdminsAndCollaboratorsTooltip: {
    id: 'app.containers.admin.project.permissions.permissionsAdminsAndCollaboratorsTooltip',
    defaultMessage:
      'Only platform admins, folder managers and project managers can take the action',
  },
  permissionsSelectionLabel: {
    id: 'app.containers.admin.project.permissions.permissionsSelectionLabel',
    defaultMessage: 'Selection',
  },
  permissionsSelectionLabelDescription: {
    id: 'app.containers.admin.project.permissions.permissionsSelectionLabelDescription',
    defaultMessage:
      'Users in specific user group(s) can participate. You can manage user groups in “Users” tab.',
  },
  participationRequirementsTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.participationRequirementsTitle',
    defaultMessage: 'Participant requirements & questions',
  },
  participationRequirementsSubtitle: {
    id: 'app.containers.AdminPage.ProjectEdit.participationRequirementsSubtitle',
    defaultMessage:
      'You can specify who can take each action, and ask additional questions to participants to collect more information.',
  },
  projectVisibilityTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.projectVisibilityTitle',
    defaultMessage: 'Project visibility',
  },
  projectVisibilitySubtitle: {
    id: 'app.containers.AdminPage.ProjectEdit.projectVisibilitySubtitle',
    defaultMessage: 'You can set the project to be invisible to certain users.',
  },
  moderationRightsTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.moderationRightsTitle',
    defaultMessage: 'Moderation',
  },
  participationAccessRightsTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.participationAccessRightsTitle2',
    defaultMessage: 'Participation',
  },
  betaLabel: {
    id: 'app.containers.AdminPage.permissions.betaLabel',
    defaultMessage: 'Beta',
  },
});
