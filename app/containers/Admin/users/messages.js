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
  tabInviteByEmail: {
    id: 'app.containers.AdminPage.User.tabInviteByEmail',
    defaultMessage: 'Invitations',
  },
  exportUsers: {
    id: 'app.containers.Admin.User.exportUsers',
    defaultMessage: 'Export all users',
  },
  deleteButton: {
    id: 'app.containers.Admin.User.deleteButton',
    defaultMessage: 'Delete',
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
  member: {
    id: 'app.containers.Admin.User.member',
    defaultMessage: 'Member Since',
  },
  admin: {
    id: 'app.containers.Admin.User.admin',
    defaultMessage: 'Admin',
  },
  delete: {
    id: 'app.containers.Admin.User.delete',
    defaultMessage: 'Delete',
  },
  deleteUser: {
    id: 'app.containers.Admin.User.deleteUser',
    defaultMessage: 'Delete user',
  },
  invitePeople: {
    id: 'app.containers.Admin.User.invitePeople',
    defaultMessage: 'Invite people',
  },
  emailListLabel: {
    id: 'app.containers.Admin.User.emailListLabel',
    defaultMessage: 'Enter the email addresses of the people you want to invite. Seperate each address by a comma.',
  },
  or: {
    id: 'app.containers.Admin.User.or',
    defaultMessage: 'Or',
  },
  importLabel: {
    id: 'app.containers.Admin.User.importLabel',
    defaultMessage: 'Import an Excel file (.xlsx) with the email addresses you want to invite.',
  },
  importInfo: {
    id: 'app.containers.Admin.User.importInfo',
    defaultMessage: `Use the column name 'email' for the column containing the email addresses.`,
  },
  adminLabel: {
    id: 'app.containers.Admin.User.adminLabel',
    defaultMessage: `Grant administrator rights to the invited people?`,
  },
  localeLabel: {
    id: 'app.containers.Admin.User.localeLabel',
    defaultMessage: 'Select the default language for the invited people',
  },
  groupsLabel: {
    id: 'app.containers.Admin.User.localeLabel',
    defaultMessage: 'Optionally select the group(s) to which the invited people belong',
  },
  groupsPlaceholder: {
    id: 'app.containers.Admin.User.groupsPlaceholder',
    defaultMessage: 'No group selected',
  },
  sendOutInvitations: {
    id: 'app.containers.Admin.User.sendOutInvitations',
    defaultMessage: 'Send out invitations',
  },
  processing: {
    id: 'app.containers.Admin.User.processing',
    defaultMessage: 'Sending out invitations. Please wait...',
  },
  save: {
    id: 'app.containers.Admin.User.save',
    defaultMessage: 'Send out invitations',
  },
  saveError: {
    id: 'app.containers.Admin.User.saveError',
    defaultMessage: 'Error',
  },
  saveSuccess: {
    id: 'app.containers.Admin.User.saveSuccess',
    defaultMessage: 'Success!',
  },
  saveErrorMessage: {
    id: 'app.containers.Admin.User.saveErrorMessage',
    defaultMessage: 'The invitations have not been sent out because the following error occured:',
  },
  saveSuccessMessage: {
    id: 'app.containers.Admin.User.saveSuccessMessage',
    defaultMessage: 'Invitation successfully sent out.',
  },
});
