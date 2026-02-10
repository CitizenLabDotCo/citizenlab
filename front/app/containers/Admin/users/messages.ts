import { defineMessages } from 'react-intl';

export default defineMessages({
  helmetTitle: {
    id: 'app.containers.Admin.Users.helmetTitle',
    defaultMessage: 'Admin - users dashboard',
  },
  helmetDescription: {
    id: 'app.containers.Admin.Users.helmetDescription',
    defaultMessage: 'User list in admin backoffice',
  },
  name: {
    id: 'app.containers.Admin.Users.name',
    defaultMessage: 'Name',
  },
  email: {
    id: 'app.containers.Admin.Users.email',
    defaultMessage: 'Email',
  },
  lastActive: {
    id: 'app.containers.Admin.Users.lastActive',
    defaultMessage: 'Last active',
  },
  joined: {
    id: 'app.containers.Admin.Users.joined',
    defaultMessage: 'Joined',
  },
  admin: {
    id: 'app.containers.Admin.Users.admin',
    defaultMessage: 'Admin',
  },
  setAsAdmin: {
    id: 'app.containers.Admin.Users.setAsAdmin',
    defaultMessage: 'Set as admin',
  },
  setAsNormalUser: {
    id: 'app.containers.Admin.Users.setAsNormalUser',
    defaultMessage: 'Set as normal user',
  },
  registeredUser: {
    id: 'app.containers.Admin.Users.registeredUser',
    defaultMessage: 'Registered user',
  },
  platformAdmin: {
    id: 'app.containers.Admin.Users.platformAdmin',
    defaultMessage: 'Platform admin',
  },
  folderManager: {
    id: 'app.containers.Admin.Users.folderManager',
    defaultMessage: 'Folder manager',
  },
  projectManager: {
    id: 'app.containers.Admin.Users.projectManager',
    defaultMessage: 'Project manager',
  },
  role: {
    id: 'app.containers.Admin.Users.role',
    defaultMessage: 'Role',
  },
  permissionToBuy: {
    id: 'app.containers.Admin.Users.permissionToBuy',
    defaultMessage:
      'To give {name} admin rights, you need to buy 1 additional seat.',
  },
  options: {
    id: 'app.containers.Admin.Users.options',
    defaultMessage: 'Options',
  },
  seeProfile: {
    id: 'app.containers.Admin.Users.seeProfile',
    defaultMessage: 'See profile',
  },
  deleteUser: {
    id: 'app.containers.Admin.Users.deleteUser',
    defaultMessage: 'Delete user',
  },
  userDeletionConfirmation: {
    id: 'app.containers.Admin.Users.userDeletionConfirmation',
    defaultMessage: 'Permanently remove this user?',
  },
  userDeletionProposalVotes: {
    id: 'app.containers.Admin.Users.userDeletionProposalVotes',
    defaultMessage:
      'This will also delete any votes by this user on proposals which are still open for voting.',
  },
  userDeletionFailed: {
    id: 'app.containers.Admin.Users.userDeletionFailed',
    defaultMessage:
      'An error occured while deleting this user, please try again.',
  },
  youCantDeleteYourself: {
    id: 'app.containers.Admin.Users.youCantDeleteYourself',
    defaultMessage:
      'You cannot delete your own account via the user admin page',
  },
  userExportFileName: {
    id: 'app.containers.Admin.Users.userExportFileName',
    defaultMessage: 'user_export',
  },
  youCantUnadminYourself: {
    id: 'app.containers.Admin.Users.youCantUnadminYourself',
    defaultMessage: 'You cannot give up your role as an admin now',
  },
  editGroup: {
    id: 'app.containers.Admin.Users.GroupsHeader.editGroup',
    defaultMessage: 'Edit Group',
  },
  deleteGroup: {
    id: 'app.containers.Admin.Users.GroupsHeader.deleteGroup',
    defaultMessage: 'Delete Group',
  },
  allUsers: {
    id: 'app.containers.Admin.Users.GroupsPanel.allUsers',
    defaultMessage: 'All users',
  },
  usersSubtitle: {
    id: 'app.containers.Admin.Users.GroupsPanel.usersSubtitle',
    defaultMessage:
      'Get an overview of all the people and organisations that registered on the platform. Add a selection of users to Manual groups or Smart groups.',
  },
  admins: {
    id: 'app.containers.Admin.Users.GroupsPanel.admins',
    defaultMessage: 'Admins',
  },
  managers: {
    id: 'app.containers.Admin.Users.GroupsPanel.managers',
    defaultMessage: 'Project managers',
  },
  seeAssignedItems: {
    id: 'app.containers.Admin.Users.GroupsPanel.seeAssignedItems',
    defaultMessage: 'Assigned items',
  },
  groupsTitle: {
    id: 'app.containers.Admin.Users.GroupsPanel.groupsTitle',
    defaultMessage: 'Groups',
  },
  noUserMatchesYourSearch: {
    id: 'app.containers.AdminPage.Users.GroupsPanel.noUserMatchesYourSearch',
    defaultMessage: 'No user matches your search',
  },
  emptyGroup: {
    id: 'app.containers.AdminPage.Users.GroupsPanel.emptyGroup',
    defaultMessage: 'There is no one in this group yet',
  },
  goToAllUsers: {
    id: 'app.containers.AdminPage.Users.GroupsPanel.goToAllUsers',
    defaultMessage: 'Go to {allUsersLink} to manually add some users.',
  },
  createGroupButton: {
    id: 'app.containers.AdminPage.Users.GroupCreation.createGroupButton',
    defaultMessage: 'Add a new group',
  },
  step1TypeNameNormal: {
    id: 'app.containers.AdminPage.Users.GroupCreation.step1TypeNameNormal',
    defaultMessage: 'Normal group',
  },
  step1TypeNameSmart: {
    id: 'app.containers.AdminPage.Users.GroupCreation.step1TypeNameSmart',
    defaultMessage: 'Smart group',
  },
  step1TypeDescriptionNormal: {
    id: 'app.containers.AdminPage.Users.GroupCreation.step1TypeDescriptionNormal',
    defaultMessage: 'You manually specify which users are part of this group.',
  },
  step1TypeDescriptionSmart: {
    id: 'app.containers.AdminPage.Users.GroupCreation.step1TypeDescriptionSmart',
    defaultMessage:
      'You specify conditions that automatically and continuously make people part of this group.',
  },
  step1CreateButtonNormal: {
    id: 'app.containers.AdminPage.Users.GroupCreation.step1CreateButtonNormal',
    defaultMessage: 'Create a normal group',
  },
  step1CreateButtonSmart: {
    id: 'app.containers.AdminPage.Users.GroupCreation.step1CreateButtonSmart',
    defaultMessage: 'Create a smart group',
  },
  step1LearnMoreGroups: {
    id: 'app.containers.AdminPage.Users.GroupCreation.step1LearnMoreGroups',
    defaultMessage: 'Learn more about groups',
  },
  readMoreArticalLink: {
    id: 'app.containers.AdminPage.Users.GroupCreation.readMoreArticalLink',
    defaultMessage:
      'https://support.govocal.com/en/articles/527589-user-management-and-user-groups',
  },
  modalHeaderStep1: {
    id: 'app.containers.AdminPage.Users.GroupCreation.modalHeaderStep1',
    defaultMessage: 'Select the type of group',
  },
  modalHeaderManual: {
    id: 'app.containers.AdminPage.Users.GroupCreation.modalHeaderManual',
    defaultMessage: 'Define a group name',
  },
  fieldGroupName: {
    id: 'app.containers.AdminPage.Users.GroupCreation.fieldGroupName',
    defaultMessage: 'Name of the group',
  },
  fieldGroupNameEmptyError: {
    id: 'app.containers.AdminPage.Users.GroupCreation.fieldGroupNameEmptyError',
    defaultMessage: 'Provide a group name',
  },
  saveGroup: {
    id: 'app.containers.AdminPage.Users.GroupCreation.saveGroup',
    defaultMessage: 'Save group',
  },
  select: {
    id: 'app.containers.AdminPage.Users.GroupsPanel.select',
    defaultMessage: 'Select',
  },
  groupDeletionConfirmation: {
    id: 'app.containers.AdminPage.Users.UsersGroup.groupDeletionConfirmation',
    defaultMessage: 'Are you sure you want to delete this group?',
  },
  moveUsersTableAction: {
    id: 'app.containers.AdminPage.Users.UsersGroup.moveUsersAction',
    defaultMessage: 'Add users to group',
  },
  moveUsersButton: {
    id: 'app.containers.AdminPage.Users.UsersGroup.moveUsersButton',
    defaultMessage: 'Add',
  },
  membershipAddFailed: {
    id: 'app.containers.AdminPage.Users.UsersGroup.membershipAddFailed',
    defaultMessage:
      'An error occured while adding users to the groups, please try again.',
  },
  membershipDelete: {
    id: 'app.containers.AdminPage.Users.UsersGroup.membershipDelete',
    defaultMessage: 'Remove from group',
  },
  membershipDeleteConfirmation: {
    id: 'app.containers.AdminPage.Users.UsersGroup.membershipDeleteConfirmation',
    defaultMessage: 'Delete selected users from this group?',
  },
  membershipDeleteFailed: {
    id: 'app.containers.AdminPage.Users.UsersGroup.membershipDeleteFailed',
    defaultMessage:
      'An error occured while deleting users from the group, please try again.',
  },
  exportAllUsers: {
    id: 'app.containers.AdminPage.Users.UsersGroup.exportAll',
    defaultMessage: 'Export all',
  },
  exportGroup: {
    id: 'app.containers.AdminPage.Users.UsersGroup.exportGroupUsers',
    defaultMessage: 'Export users in group',
  },
  exportSelectedUsers: {
    id: 'app.containers.AdminPage.Users.UsersGroup.exportSelected',
    defaultMessage: 'Export selected',
  },
  userInvitationPending: {
    id: 'app.containers.Admin.Users.UserTableRow.userInvitationPending',
    defaultMessage: 'Invitation pending',
  },
  blockedUsers: {
    id: 'app.containers.Admin.Users.BlockedUsers.blockedUsers',
    defaultMessage: 'Blocked users',
  },
  blockedUsersSubtitle: {
    id: 'app.containers.Admin.Users.BlockedUsers.blockedUsersSubtitle',
    defaultMessage: 'Manage blocked users.',
  },
  inviteUsers: {
    id: 'app.containers.Admin.Users.inviteUsers',
    defaultMessage: 'Invite users',
  },
  userInsights: {
    id: 'app.containers.Admin.Users.userInsights',
    defaultMessage: 'User insights',
  },
  remove: {
    id: 'app.containers.Admin.Users.remove',
    defaultMessage: 'Remove',
  },
  assignedItemsFor: {
    id: 'app.containers.Admin.Users.assignedItems',
    defaultMessage: 'Assigned items for {name}',
  },
  noAssignedItems: {
    id: 'app.containers.Admin.Users.noAssignedItems',
    defaultMessage: 'No assigned items',
  },
  removeModeratorFrom: {
    id: 'app.containers.Admin.Users.removeModeratorFrom',
    defaultMessage:
      'The user is moderating the folder this project belongs to. Remove assignment from "{folderTitle}" instead.',
  },
  setAsProjectModerator: {
    id: 'app.containers.Admin.Users.setAsProjectModerator',
    defaultMessage: 'Assign as project manager',
  },
  folder: {
    id: 'app.containers.Admin.Users.folder',
    defaultMessage: 'Folder',
  },
  setUserAsProjectModerator: {
    id: 'app.containers.Admin.Users.setUserAsProjectModerator',
    defaultMessage: 'Assign {name} as project manager',
  },
  assign: {
    id: 'app.containers.Admin.Users.assign',
    defaultMessage: 'Assign',
  },
  selectPublications: {
    id: 'app.containers.Admin.Users.selectPublications',
    defaultMessage: 'Select projects or folders',
  },
  selectPublicationsPlaceholder: {
    id: 'app.containers.Admin.Users.selectPublicationsPlaceholder',
    defaultMessage: 'Type to search',
  },
  projectFilterPlaceholder: {
    id: 'app.containers.Admin.Users.projectFilterPlaceholder',
    defaultMessage: 'Filter by project',
  },
  bannedEmails: {
    id: 'app.containers.Admin.Users.BannedEmails.bannedEmails',
    defaultMessage: 'Banned emails',
  },
  bannedEmailsSubtitle: {
    id: 'app.containers.Admin.Users.BannedEmails.bannedEmailsSubtitle',
    defaultMessage: 'Manage email addresses blocked from registration',
  },
  totalBannedEmails: {
    id: 'app.containers.Admin.Users.BannedEmails.totalBannedEmails',
    defaultMessage: 'Total banned emails',
  },
  checkEmailBan: {
    id: 'app.containers.Admin.Users.BannedEmails.checkEmailBan',
    defaultMessage: 'Check if an email is banned',
  },
  enterEmailPlaceholder: {
    id: 'app.containers.Admin.Users.BannedEmails.enterEmailPlaceholder',
    defaultMessage: 'Enter email address',
  },
  checkButton: {
    id: 'app.containers.Admin.Users.BannedEmails.checkButton',
    defaultMessage: 'Check',
  },
  emailIsBanned: {
    id: 'app.containers.Admin.Users.BannedEmails.emailIsBanned',
    defaultMessage: '{email} is banned',
  },
  emailNotBanned: {
    id: 'app.containers.Admin.Users.BannedEmails.emailNotBanned',
    defaultMessage: '{email} is not banned',
  },
  banReason: {
    id: 'app.containers.Admin.Users.BannedEmails.banReason',
    defaultMessage: 'Reason',
  },
  unbanButton: {
    id: 'app.containers.Admin.Users.BannedEmails.unbanButton',
    defaultMessage: 'Unban email',
  },
});
