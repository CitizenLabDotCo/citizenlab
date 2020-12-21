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
  permissionsUsersLabel: {
    id: 'app.containers.admin.project.permissions.permissionsUsersLabel',
    defaultMessage: 'All users',
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
    id:
      'app.containers.AdminPage.groups.permissions.groupsMultipleSelectPlaceholder',
    defaultMessage: 'Select one or more groups',
  },
  members: {
    id: 'app.containers.AdminPage.groups.permissions.members',
    defaultMessage:
      '{count, plural, =0 {No members} one {1 member} other {{count} members}}',
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
    defaultMessage:
      'Are you sure you want to remove this group from the project?',
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
  permissionAction_comment_ideas: {
    id:
      'app.containers.AdminPage.groups.permissions.permissionAction_comment_ideas',
    defaultMessage: 'Comment on ideas',
  },
  permissionAction_vote_ideas: {
    id:
      'app.containers.AdminPage.groups.permissions.permissionAction_vote_ideas',
    defaultMessage: 'Vote on ideas',
  },
  permissionAction_post_idea: {
    id:
      'app.containers.AdminPage.groups.permissions.permissionAction_post_idea',
    defaultMessage: 'Post an idea',
  },
  permissionAction_comment_proposals: {
    id:
      'app.containers.AdminPage.groups.permissions.permissionAction_comment_proposal',
    defaultMessage: 'Comment on proposals',
  },
  permissionAction_vote_proposals: {
    id:
      'app.containers.AdminPage.groups.permissions.permissionAction_vote_proposal',
    defaultMessage: 'Vote on proposals',
  },
  permissionAction_post_proposal: {
    id:
      'app.containers.AdminPage.groups.permissions.permissionAction_post_proposal',
    defaultMessage: 'Post a proposal',
  },
  permissionAction_take_survey: {
    id:
      'app.containers.AdminPage.groups.permissions.permissionAction_take_survey',
    defaultMessage: 'Take the survey',
  },
  permissionAction_take_poll: {
    id:
      'app.containers.AdminPage.groups.permissions.permissionAction_take_poll',
    defaultMessage: 'Take the poll',
  },
  permissionAction_budgeting: {
    id:
      'app.containers.AdminPage.groups.permissions.permissionAction_budgeting',
    defaultMessage: 'Spending budget',
  },
  noActionsCanBeTakenInThisProject: {
    id:
      'app.containers.AdminPage.groups.permissions.noActionsCanBeTakenInThisProject',
    defaultMessage:
      'Nothing is shown, because there are no actions the user can take in this project.',
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
    id:
      'app.containers.AdminPage.groups.permissions.moderatorDeletionConfirmation',
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
  projectManagerTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.projectManagerTooltip',
    defaultMessage:
      'Project managers can edit projects, manage posts and email participants. You can {moderationInfoCenterLink} to find more information about the rights assigned to project managers.',
  },
  moderationInfoCenterLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.moderationInfoCenterLinkText',
    defaultMessage: 'visit our Help Center',
  },
  moreInfoModeratorLink: {
    id: 'app.containers.AdminPage.ProjectEdit.moreInfoModeratorLink',
    defaultMessage:
      'http://support.citizenlab.co/en-your-citizenlab-platform-step-by-step/set-up/pointing-out-the-right-project-moderators',
  },
  postAssignmentSectionTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.postAssignmentSectionTitle',
    defaultMessage: 'Who is responsible for processing the posts?',
  },
  postAssignmentTooltipText: {
    id: 'app.containers.AdminPage.ProjectEdit.postAssignmentTooltipText',
    defaultMessage:
      'All new posts in this project will be assigned to this person. The assignee can be changed in the {ideaManagerLink}.',
  },
  postManagerLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.postManagerLinkText',
    defaultMessage: 'post manager',
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
