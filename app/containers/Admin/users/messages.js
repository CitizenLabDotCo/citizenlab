import { defineMessages } from 'react-intl';

export default defineMessages({
  helmetTitle: {
    id: 'app.containers.Admin.User.helmetTitle',
    defaultMessage: 'Admin - users dashboard',
  },
  helmetDescription: {
    id: 'app.containers.Admin.User.helmetDescription',
    defaultMessage: 'User list in admin backoffice',
  },
  viewPublicResource: {
    id: 'app.containers.Admin.User.viewPublicResource',
    defaultMessage: 'Users',
  },
  tabRegisteredUsers: {
    id: 'app.containers.AdminPage.User.tabRegisteredUsers',
    defaultMessage: 'Registered users',
  },
  deleteFromGroupButton: {
    id: 'app.containers.Admin.User.deleteFromGroupButton',
    defaultMessage: 'Delete users from group',
  },
  updateButton: {
    id: 'app.containers.Admin.User.updateButton',
    defaultMessage: 'Edit',
  },
  createButton: {
    id: 'app.containers.Admin.User.createButton',
    defaultMessage: 'New User',
  },
  publishButton: {
    id: 'app.containers.Admin.User.publishButton',
    defaultMessage: 'Publish User',
  },
  userLoadingMessage: {
    id: 'app.containers.Admin.User.userLoadingMessage',
    defaultMessage: 'Loading User...',
  },
  userLoadingError: {
    id: 'app.containers.Admin.User.userLoadingError',
    defaultMessage: 'User not found!',
  },
  name: {
    id: 'app.containers.Admin.User.name',
    defaultMessage: 'Name',
  },
  email: {
    id: 'app.containers.Admin.User.email',
    defaultMessage: 'Email',
  },
  since: {
    id: 'app.containers.Admin.User.since',
    defaultMessage: 'Since',
  },
  member: {
    id: 'app.containers.Admin.User.member',
    defaultMessage: 'Member Since',
  },
  admin: {
    id: 'app.containers.Admin.User.admin',
    defaultMessage: 'Admin',
  },
  options: {
    id: 'app.containers.Admin.User.options',
    defaultMessage: 'Options',
  },
  delete: {
    id: 'app.containers.Admin.User.delete',
    defaultMessage: 'Delete',
  },
  seeProfile: {
    id: 'app.containers.Admin.User.seeProfile',
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
    defaultMessage: 'An error occured while deleting this user, please try again.',
  },
  youCantDeleteYourself: {
    id: 'app.containers.Admin.Users.youCantDeleteYourself',
    defaultMessage: 'You cannot delete your own account via the user admin page',
  },
  youCantUnadminYourself: {
    id: 'app.containers.Admin.Users.youCantUnadminYourself',
    defaultMessage: 'You cannot give up your role as an admin now',
  },
  saveSuccess: {
    id: 'app.containers.Admin.User.saveSuccess',
    defaultMessage: 'Success!',
  },
  confirmDelete: {
    id: 'app.containers.Admin.User.confirmDelete',
    defaultMessage: 'Yes, I\'m sure',
  },
  editGroup: {
    id: 'app.containers.Admin.User.GroupsHeader.editGroup',
    defaultMessage: 'Edit Group',
  },
  deleteGroup: {
    id: 'app.containers.Admin.User.GroupsHeader.deleteGroup',
    defaultMessage: 'Delete Group',
  },
  allUsers: {
    id: 'app.containers.Admin.User.GroupsPanel.allUsers',
    defaultMessage: 'All users',
  },
  groupsTitle: {
    id: 'app.containers.Admin.User.GroupsPanel.groupsTitle',
    defaultMessage: 'Groups',
  },
  emptyGroup: {
    id: 'app.containers.AdminPage.Users.GroupsPanel.emptyGroup',
    defaultMessage: 'There is no users in this group yet',
  },
  goToAllUsers: {
    id: 'app.containers.AdminPage.Users.GroupsPanel.goToAllUsers',
    defaultMessage: 'Go on the {allUsersLink} tab to move users manually.',
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
    defaultMessage: 'You have to add users manually to the group.',
  },
  step1TypeDescriptionSmart: {
    id: 'app.containers.AdminPage.Users.GroupCreation.step1TypeDescriptionSmart',
    defaultMessage: 'A smart group add continually and automatically users based on specific conditions you setup.',
  },
  step1CreateButtonNormal: {
    id: 'app.containers.AdminPage.Users.GroupCreation.step1CreateButtonNormal',
    defaultMessage: 'Create a normal group',
  },
  step1CreateButtonSmart: {
    id: 'app.containers.AdminPage.Users.GroupCreation.step1CreateButtonSmart',
    defaultMessage: 'Create a smart group',
  },
  step1ReadMore: {
    id: 'app.containers.AdminPage.Users.GroupCreation.step1ReadMore',
    defaultMessage: 'Read More about it',
  },
  modalHeaderStep1: {
    id: 'app.containers.AdminPage.Users.GroupCreation.modalHeaderStep1',
    defaultMessage: 'Select the type of group',
  },
  modalHeaderManual: {
    id: 'app.containers.AdminPage.Users.GroupCreation.modalHeaderManual',
    defaultMessage: 'Define a group name',
  },
  modalHeaderRules: {
    id: 'app.containers.AdminPage.Users.GroupCreation.modalHeaderRules',
    defaultMessage: 'Define your smart group settings',
  },
  fieldGroupName: {
    id: 'app.containers.AdminPage.Users.GroupCreation.fieldGroupName',
    defaultMessage: 'Name of the group',
  },
  fieldRulesLabel: {
    id: 'app.containers.AdminPage.Users.GroupCreation.fieldRulesLabel',
    defaultMessage: 'Define who will be automatically added to the group',
  },
  groupFormTitle: {
    id: 'app.containers.AdminPage.Users.GroupCreation.groupFormTitle',
    defaultMessage: 'Define a group name',
  },
  rulesGroupHeader: {
    id: 'app.containers.AdminPage.Users.GroupCreation.rulesGroupHeader',
    defaultMessage: 'Make the user(s) matching ALL the following conditions part of the group:',
  },
  selectAll: {
    id: 'app.containers.AdminPage.Users.GroupsPanel.selectAll',
    defaultMessage: 'Select all',
  },
  xUsers: {
    id: 'app.containers.AdminPage.Users.GroupsPanel.xUsers',
    defaultMessage: '{count, plural, zero {No users} one {1 user} other {{count} users}}',
  },
  groupDeletionConfirmation: {
    id: 'app.containers.AdminPage.Users.UsersGroup.groupDeletionConfirmation',
    defaultMessage: 'Are you sure you want to delete this group?',
  },
  deleteUserConfirmation: {
    id: 'app.containers.AdminPage.Users.UsersGroup.deleteUserConfirmation',
    defaultMessage: 'Are you sure you want to delete this user?',
  },
  moveUsers: {
    id: 'app.containers.AdminPage.Users.UsersGroup.moveUsers',
    defaultMessage: 'Add selected users to group',
  },
  membershipAddFailed: {
    id: 'app.containers.AdminPage.Users.UsersGroup.membershipAddFailed',
    defaultMessage: 'An error occured while adding users to the groups, please try again.',
  },
  membershipDelete: {
    id: 'app.containers.AdminPage.Users.UsersGroup.membershipDelete',
    defaultMessage: 'Delete selected users from group',
  },
  membershipDeleteConfirmation: {
    id: 'app.containers.AdminPage.Users.UsersGroup.membershipDeleteConfirmation',
    defaultMessage: 'Delete selected users from this group?',
  },
  membershipDeleteFailed: {
    id: 'app.containers.AdminPage.Users.UsersGroup.membershipDeleteFailed',
    defaultMessage: 'An error occured while deleting users from the group, please try again.',
  },
  exportUsers: {
    id: 'app.containers.AdminPage.Users.UsersGroup.exportUsers',
    defaultMessage: 'Export all users',
  },
  add: {
    id: 'app.containers.AdminPage.Users.UsersGroup.add',
    defaultMessage: 'Add',
  },
  dropdownFooterMessage: {
    id: 'app.containers.AdminPage.Users.UsersGroup.dropdownFooterMessage',
    defaultMessage: 'Add',
  },
});
