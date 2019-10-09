import { defineMessages } from 'react-intl';

export default defineMessages({
  helmetTitle: {
    id: 'app.containers.Admin.Invitations.helmetTitle',
    defaultMessage: 'Admin invitation dashboard',
  },
  helmetDescription: {
    id: 'app.containers.Admin.Invitations.helmetDescription',
    defaultMessage: 'Invite users to the platform',
  },
  name: {
    id: 'app.containers.Admin.Invitations.name',
    defaultMessage: 'Name',
  },
  email: {
    id: 'app.containers.Admin.Invitations.email',
    defaultMessage: 'Email',
  },
  invitePeople: {
    id: 'app.containers.Admin.Invitations.invitePeople',
    defaultMessage: 'Invite people via email',
  },
  invitationSubtitle: {
    id: 'app.containers.Admin.Invitations.invitationSubtitle',
    defaultMessage: 'Invite people to the platform at any point in time. They get a neutral invitation email with your logo, in which they are asked to register on the platform.',
  },
  importTab: {
    id: 'app.containers.Admin.Invitations.importTab',
    defaultMessage: 'Import email addresses',
  },
  textTab: {
    id: 'app.containers.Admin.Invitations.textTab',
    defaultMessage: 'Manually enter email addresses',
  },
  emailListLabel: {
    id: 'app.containers.Admin.Invitations.emailListLabel',
    defaultMessage: 'Manually enter the email addresses of the people you want to invite. Seperate each address by a comma.',
  },
  importLabel: {
    id: 'app.containers.Admin.Invitations.importLabel',
    defaultMessage: 'Select an Excel file (.xlsx)',
  },
  importInfo: {
    id: 'app.containers.Admin.Invitations.importInfo',
    defaultMessage: `
      Note: The column in your Excel file that contains the email addresses should be named {emailColumnName}.
      Download this {downloadLink} and visit this {supportPageLink} for more information about all the supported columns.
    `,
  },
  emailColumnName: {
    id: 'app.containers.Admin.Invitations.emailColumnName',
    defaultMessage: 'email',
  },
  exampleFile: {
    id: 'app.containers.Admin.Invitations.exampleFile',
    defaultMessage: 'example file',
  },
  supportPage: {
    id: 'app.containers.Admin.Invitations.supportPage',
    defaultMessage: 'support page',
  },
  importOptionsInfo: {
    id: 'app.containers.Admin.Invitations.importOptionsInfo',
    defaultMessage: `
      These options will only be taken into account when they are not defined in the Excel file.
      Please visit the {supportPageLink} for more information.
    `,
  },
  adminLabel: {
    id: 'app.containers.Admin.Invitations.adminLabel',
    defaultMessage: 'Grant administrator rights to the invited people?',
  },
  adminLabelTooltip: {
    id: 'app.containers.Admin.Invitations.adminLabelTooltip',
    defaultMessage: 'When toggled on, people receiving and accepting your invitation will also have access to all admin settings of the platform.',
  },
  moderatorLabel: {
    id: 'app.containers.Admin.Invitations.moderatorLabel',
    defaultMessage: 'Grant project moderator rights to the invited people?',
  },
  moderatorLabelTooltip: {
    id: 'app.containers.Admin.Invitations.moderatorLabelTooltip',
    defaultMessage: 'When toggled on, people receiving and accepting your invitation will also have moderator rights to one or multiple projects. More info on the project moderator role {moderatorLabelTooltipLink}.',
  },
  moderatorLabelTooltipLink: {
    id: 'app.containers.Admin.Invitations.moderatorLabelTooltipLink',
    defaultMessage: 'http://support.citizenlab.co/en-your-citizenlab-platform-step-by-step/set-up/pointing-out-the-right-project-moderators',
  },
  moderatorLabelTooltipLinkText: {
    id: 'app.containers.Admin.Invitations.moderatorLabelTooltipLinkText',
    defaultMessage: 'here',
  },
  projectSelectorPlaceholder: {
    id: 'app.containers.Admin.Invitations.projectSelectorPlaceholder',
    defaultMessage: 'No project(s) selected',
  },
  localeLabel: {
    id: 'app.containers.Admin.Invitations.localeLabel',
    defaultMessage: 'Select the default language for the invited people',
  },
  invitationOptions: {
    id: 'app.containers.Admin.Invitations.invitationOptions',
    defaultMessage: 'Invitation options',
  },
  groupsLabel: {
    id: 'app.containers.Admin.Invitations.groupsLabel',
    defaultMessage: 'Optionally select one or more groups that will be assigned to the invited people upon registration',
  },
  inviteTextLabel: {
    id: 'app.containers.Admin.Invitations.inviteTextLabel',
    defaultMessage: 'Optionally type a message that will be added to the invitation mail.',
  },
  groupsPlaceholder: {
    id: 'app.containers.Admin.Invitations.groupsPlaceholder',
    defaultMessage: 'No group selected',
  },
  processing: {
    id: 'app.containers.Admin.Invitations.processing',
    defaultMessage: 'Sending out invitations. Please wait...',
  },
  save: {
    id: 'app.containers.Admin.Invitations.save',
    defaultMessage: 'Send out invitations',
  },
  saveSuccess: {
    id: 'app.containers.Admin.Invitations.saveSuccess',
    defaultMessage: 'Success!',
  },
  saveErrorMessage: {
    id: 'app.containers.Admin.Invitations.saveErrorMessage',
    defaultMessage: `
      One or more errors occured.
      Therefore no invitations were sent out.
      Please correct the error(s) listed below and try again.
    `,
  },
  saveSuccessMessage: {
    id: 'app.containers.Admin.Invitations.saveSuccessMessage',
    defaultMessage: 'Invitation successfully sent out.',
  },
  inviteStatus: {
    id: 'app.containers.Admin.Invitations.inviteStatus',
    defaultMessage: 'Status',
  },
  invitedSince: {
    id: 'app.containers.Admin.Invitations.invitedSince',
    defaultMessage: 'Invited',
  },
  deleteInvite: {
    id: 'app.containers.Admin.Invitations.deleteInvite',
    defaultMessage: 'Delete',
  },
  deleteInviteTooltip: {
    id: 'app.containers.Admin.Invitations.deleteInviteTooltip',
    defaultMessage: 'Cancelling an invitation will allow you to resend an invitation to these persons.',
  },
  exportInvites: {
    id: 'app.containers.Admin.Invitations.exportInvites',
    defaultMessage: 'Export all invitations',
  },
  inviteStatusPending: {
    id: 'app.containers.Admin.Invitations.inviteStatusPending',
    defaultMessage: 'Pending',
  },
  inviteStatusAccepted: {
    id: 'app.containers.Admin.Invitations.inviteStatusAccepted',
    defaultMessage: 'Accepted',
  },
  confirmDelete: {
    id: 'app.containers.Admin.Invitations.confirmDelete',
    defaultMessage: 'Yes, I\'m sure',
  },
  currentlyNoInvitesThatMatchSearch: {
    id: 'app.containers.Admin.Invitations.currentlyNoInvitesThatMatchSearch',
    defaultMessage: 'There are no invites that match your search',
  },
  filetypeError: {
    id: 'app.containers.Admin.Invitations.filetypeError',
    defaultMessage: 'Incorrect file type. Only XLSX files are supported.',
  },
  unknownError: {
    id: 'app.containers.Admin.Invitations.unknownError',
    defaultMessage: 'Something went wrong. Please try again later.',
  },
});
