import { defineMessages } from 'react-intl';

export default defineMessages({
  titlePermissions: {
    id: 'app.containers.admin.project.permissions.titlePermissions',
    defaultMessage: 'Manage permissions',
  },
  subtitlePermissions: {
    id: 'app.containers.admin.project.permissions.subtitlePermissions',
    defaultMessage: 'Define who can view the project and who can manage it as a project moderator. Also, granular participation rights can be assigned. Contact support@citizenlab.co if you require this.',
  },
  permissionTypeLabel: {
    id: 'app.containers.admin.project.permissions.permissionTypeLabel',
    defaultMessage: 'Who can view this project?',
  },
  permissionsTypeTooltip: {
    id: 'app.containers.admin.project.permissions.permissionsTypeTooltip',
    defaultMessage: 'Choose for whom this project will be visible: all, users with admin rights only or a specific selection of users. All other users simply won’t see the project nor its content.',
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
  noSelectedGroupsMessage: {
    id: 'app.containers.AdminPage.groups.permissions.noSelectedGroupsMessage',
    defaultMessage: `Select one or more groups that can access this project`,
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
    defaultMessage: 'Who can take which action?',
  },
  granularPermissionsTooltip: {
    id: 'app.containers.AdminPage.groups.permissions.granularPermissionsTooltip',
    defaultMessage: 'The users that aren’t part of the selection will see an information message when trying to access the respective action, explaining them that they don’t have access to the action.',
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
  noActionsCanBeTaken: {
    id: 'app.containers.AdminPage.groups.permissions.noActionsCanBeTaken',
    defaultMessage: 'No permissions to configure, since the user can\'t do anything here',
  },
  engagementWarning: {
    id: 'app.containers.AdminPage.groups.permissions.engagementWarning',
    defaultMessage: 'Apply these restrictions carefully, as higher barriers lead to lower engagement.',
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
  moderatorsRoleExplanation: {
    id: 'app.containers.AdminPage.ProjectEdit.moderatorsRoleExplanation',
    defaultMessage: 'Moderation rights grant somebody who\'s not an admin the rights to alter the project settings and moderate ideas and comments which belong to this project. Admins always have Moderation rights over all projects.',
  },
  moderatorsSectionTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.moderatorsSectionTooltip',
    defaultMessage: 'Select those users who will be given moderator rights, allowing them to work on this project, process its ideas, email its participants, etc.. They will receive a personal message to inform them. More on the role of project moderator can be found {moreInfoModeratorLink}.',
  },
  moreInfoModeratorLink: {
    id: 'app.containers.AdminPage.ProjectEdit.moreInfoModeratorLink',
    defaultMessage: 'http://support.citizenlab.co/en-your-citizenlab-platform-step-by-step/set-up/pointing-out-the-right-project-moderators',
  },
  moreInfoModeratorLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.moreInfoModeratorLinkText',
    defaultMessage: 'here',
  },
  ideaAssignmentSectionTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.ideaAssignmentSectionTitle',
    defaultMessage: 'Who is the main responsible for this project?',
  },
  ideaAssignmentTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.ideaAssignmentTooltip',
    defaultMessage: 'Every new idea within this project will be assigned to this person by default. The main responsible will get notified when a new idea gets added. Idea assignment can be easily changed in the {linkToIdeasOverview}.',
  },
  ideasOverview: {
    id: 'app.containers.AdminPage.ProjectEdit.ideasOverview',
    defaultMessage: 'Ideas overview',
  },
  unassigned: {
    id: 'app.containers.AdminPage.ProjectEdit.unassigned',
    defaultMessage: 'Unassigned',
  },
  selectGroups: {
    id: 'app.containers.AdminPage.ProjectEdit.selectGroups',
    defaultMessage: 'Select group(s)',
  }
});
