import { defineMessages } from 'react-intl';

export default defineMessages({
  none: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.none',
    defaultMessage: 'None',
  },
  noneSubtitle: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.noneSubtitle',
    defaultMessage: 'Anyone can participate without signing up or logging in.',
  },
  emailConfirmation: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.emailConfirmation',
    defaultMessage: 'Email confirmation',
  },
  emailConfirmationSubtitle: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.emailConfirmationSubtitle',
    defaultMessage:
      'Participants need to confirm their email with a one-time code.',
  },
  accountCreation: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.accountCreation',
    defaultMessage: 'Account creation',
  },
  accountCreationSubtitle: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.accountCreationSubtitle',
    defaultMessage:
      'Participants need to create a full account with their name, confirmed email and password.',
  },
  accountCreationSubtitle_confirmationOff: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.accountCreationSubtitle_confirmationOff',
    defaultMessage:
      'Participants need to create a full account with their name, email and password.',
  },
  ssoVerification: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.ssoVerification',
    defaultMessage: 'SSO verification',
  },
  ssoVerificationSubtitle: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.ssoVerificationSubtitle2',
    defaultMessage:
      'Participants need to verify their identify with {verificationMethod}.',
  },
  restrictParticipation: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.restrictParticipation',
    defaultMessage: 'Restrict participation to user group(s)',
  },
  authentication: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.authentication',
    defaultMessage: 'Authentication',
  },
  resetExtraQuestionsAndGroups: {
    id: 'app.containers.Admin.projects.project.permissions.components.PhasePermissionsNew.ActionsFormNew.resetExtraQuestionsAndGroups',
    defaultMessage: 'Reset extra questions and groups',
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
  granularPermissionsOffText: {
    id: 'app.containers.AdminPage.groups.permissions.granularPermissionsOffText',
    defaultMessage:
      'Changing granular permissions is not part of your license. Please contact your GovSuccess Manager to learn more about it.',
  },
  selectGroups: {
    id: 'app.containers.AdminPage.ProjectEdit.selectGroups',
    defaultMessage: 'Select group(s)',
  },
});
