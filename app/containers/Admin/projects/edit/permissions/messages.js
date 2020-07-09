import { defineMessages } from 'react-intl';

export default defineMessages({
  viewingRightsTitle: {
    id: 'app.containers.admin.project.permissions.viewingRightsTitle',
    defaultMessage: 'Who can see this project?',
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
  add: {
    id: 'app.containers.AdminPage.groups.permissions.add',
    defaultMessage: 'Add',
  },
  groupsMultipleSelectPlaceholder: {
    id: 'app.containers.AdminPage.groups.permissions.groupsMultipleSelectPlaceholder',
    defaultMessage: 'Select one or more groups',
  },
  members: {
    id: 'app.containers.AdminPage.groups.permissions.members',
    defaultMessage: '{count, plural, =0 {No members} one {1 member} other {{count} members}}',
  },
  deleteButtonLabel: {
    id: 'app.containers.AdminPage.groups.permissions.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.AdminPage.groups.permissions.editButtonLabel',
    defaultMessage: 'Edit',
  },
  groupDeletionConfirmation: {
    id: 'app.containers.AdminPage.groups.permissions.groupDeletionConfirmation',
    defaultMessage: 'Are you sure you want to remove this group from the project?',
  },
  save: {
    id: 'app.containers.AdminPage.groups.permissions.save',
    defaultMessage: 'Save',
  },
  saveSuccess: {
    id: 'app.containers.AdminPage.groups.permissions.saveSuccess',
    defaultMessage: 'Success!',
  },
  saveErrorMessage: {
    id: 'app.containers.AdminPage.groups.permissions.saveErrorMessage',
    defaultMessage: 'Something went wrong, please try again later.',
  },
  saveSuccessMessage: {
    id: 'app.containers.AdminPage.groups.permissions.saveSuccessMessage',
    defaultMessage: 'Your changes have been saved.',
  },
  granularPermissionsTitle: {
    id: 'app.containers.AdminPage.groups.permissions.granularPermissionsTitle',
    defaultMessage: 'What can different users do?',
  },
  permissionAction_commenting: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_commenting',
    defaultMessage: 'Commenting',
  },
  permissionAction_voting: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_voting',
    defaultMessage: 'Voting',
  },
  permissionAction_posting: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_posting',
    defaultMessage: 'Posting ideas',
  },
  permissionAction_taking_survey: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_taking_survey',
    defaultMessage: 'Taking the survey',
  },
  permissionAction_taking_poll: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_taking_poll',
    defaultMessage: 'Taking the poll',
  },
  permissionAction_budgeting: {
    id: 'app.containers.AdminPage.groups.permissions.permissionAction_budgeting',
    defaultMessage: 'Spending budget',
  },
  noActionsCanBeTakenInThisProject: {
    id: 'app.containers.AdminPage.groups.permissions.noActionsCanBeTakenInThisProject',
    defaultMessage: 'Nothing is shown, because there are no actions the user can take in this project.'
  },
  pendingInvitation: {
    id: 'app.containers.AdminPage.groups.permissions.pendingInvitation',
    defaultMessage: 'Pending invitation',
  },
  unknownName: {
    id: 'app.containers.AdminPage.groups.permissions.unknownName',
    defaultMessage: 'Unknown name',
  },
  moderatorDeletionConfirmation: {
    id: 'app.containers.AdminPage.groups.permissions.moderatorDeletionConfirmation',
    defaultMessage: 'Are you sure?',
  },
  deleteModeratorLabel: {
    id: 'app.containers.AdminPage.groups.permissions.deleteModeratorLabel',
    defaultMessage: 'Delete',
  },
  moderatorsNotFound: {
    id: 'app.containers.AdminPage.groups.permissions.moderatorsNotFound',
    defaultMessage: 'Moderators not found',
  },
  moderatorsSectionTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.moderatorsSectionTitle',
    defaultMessage: 'Who can moderate this project?',
  },
  moderatorsTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.moderatorsTooltip',
    defaultMessage: 'Moderators can edit the project, manage its ideas and email people who participated. You can {moderationInfoCenterLink} to find more information on moderation rights.',
  },
  moderationInfoCenterLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.moderationInfoCenterLinkText',
    defaultMessage: 'visit our Help Center',
  },
  moreInfoModeratorLink: {
    id: 'app.containers.AdminPage.ProjectEdit.moreInfoModeratorLink',
    defaultMessage: 'http://support.citizenlab.co/en-your-citizenlab-platform-step-by-step/set-up/pointing-out-the-right-project-moderators',
  },
  ideaAssignmentSectionTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.ideaAssignmentSectionTitle',
    defaultMessage: 'Who is responsible for processing the ideas?',
  },
  ideaAssignmentTooltipText: {
    id: 'app.containers.AdminPage.ProjectEdit.ideaAssignmentTooltipText',
    defaultMessage: 'The person responsible for the ideas will get all new ideas in this project assigned to him/her. The assignee can always be changed manually in the {ideaManagerLink}.',
  },
  ideaManagerLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.ideaManagerLinkText',
    defaultMessage: 'idea manager',
  },
  unassigned: {
    id: 'app.containers.AdminPage.ProjectEdit.unassigned',
    defaultMessage: 'Unassigned',
  },
  selectGroups: {
    id: 'app.containers.AdminPage.ProjectEdit.selectGroups',
    defaultMessage: 'Select group(s)',
  },
  participationAccessRightsTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.participationAccessRightsTitle',
    defaultMessage: 'Participation',
  },
  moderationRightsTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.moderationRightsTitle',
    defaultMessage: 'Moderation',
  },
});
