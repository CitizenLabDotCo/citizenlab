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
  permissionsAdministratorsAndManagers: {
    id: 'app.containers.admin.project.permissions.permissionsAdministratorsAndManagers',
    defaultMessage: 'Administrators and the managers of this project',
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
    id: 'app.containers.AdminPage.ProjectEdit.participationRequirementsTitle1',
    defaultMessage: 'Phase access and user data',
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
});
