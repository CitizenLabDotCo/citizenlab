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
  since: {
    id: 'app.containers.Admin.Users.since',
    defaultMessage: 'Since',
  },
  admin: {
    id: 'app.containers.Admin.Users.admin',
    defaultMessage: 'Admin',
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
    id:
      'app.containers.AdminPage.Users.GroupCreation.step1TypeDescriptionNormal',
    defaultMessage: 'You manually specify which users are part of this group.',
  },
  step1TypeDescriptionSmart: {
    id:
      'app.containers.AdminPage.Users.GroupCreation.step1TypeDescriptionSmart',
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
  readMoreLink: {
    id: 'app.containers.AdminPage.Users.GroupCreation.readMoreLink',
    defaultMessage:
      'http://support.citizenlab.co/nl-opstartgids/stap-2-configureer-de-belangrijkste-settings/maak-eventueel-verschillende-gebruikersgroepen-aan',
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
  select: {
    id: 'app.containers.AdminPage.Users.GroupsPanel.select',
    defaultMessage: 'Select',
  },
  groupDeletionConfirmation: {
    id: 'app.containers.AdminPage.Users.UsersGroup.groupDeletionConfirmation',
    defaultMessage: 'Are you sure you want to delete this group?',
  },
  moveUsersTableAction: {
    id: 'app.containers.AdminPage.Users.UsersGroup.moveUsersTableAction',
    defaultMessage: 'Add selected users to a group',
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
    id:
      'app.containers.AdminPage.Users.UsersGroup.membershipDeleteConfirmation',
    defaultMessage: 'Delete selected users from this group?',
  },
  membershipDeleteFailed: {
    id: 'app.containers.AdminPage.Users.UsersGroup.membershipDeleteFailed',
    defaultMessage:
      'An error occured while deleting users from the group, please try again.',
  },
  exportAllUsers: {
    id: 'app.containers.AdminPage.Users.UsersGroup.exportAllUsers',
    defaultMessage: 'Export all users',
  },
  exportGroup: {
    id: 'app.containers.AdminPage.Users.UsersGroup.exportGroup',
    defaultMessage: 'Export group',
  },
  exportSelectedUsers: {
    id: 'app.containers.AdminPage.Users.UsersGroup.exportSelectedUsers',
    defaultMessage: 'Export selected users',
  },
});
