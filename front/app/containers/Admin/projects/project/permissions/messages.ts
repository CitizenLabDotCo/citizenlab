import { defineMessages } from 'react-intl';

export default defineMessages({
  permissionsAnyoneLabel: {
    id: 'app.containers.admin.project.permissions.permissionsAnyoneLabel',
    defaultMessage: 'Anyone',
  },

  permissionsAdministratorsAndManagers: {
    id: 'app.containers.admin.project.permissions.permissionsAdministratorsAndManagers',
    defaultMessage: 'Administrators and the managers of this project',
  },
  permissionsSelectionLabel: {
    id: 'app.containers.admin.project.permissions.permissionsSelectionLabel',
    defaultMessage: 'Selection',
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
