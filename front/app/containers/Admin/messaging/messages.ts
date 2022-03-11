/*
 * Admin.emails Messages
 *
 * This contains all the text for the admins email.
 */

import { defineMessages } from 'react-intl';

export default defineMessages({
  titleEmails: {
    id: 'app.containers.Admin.emails.titleEmails',
    defaultMessage: 'Email Campaigns',
  },
  subtitleEmails: {
    id: 'app.containers.Admin.emails.subtitleEmails',
    defaultMessage:
      'Compose your own emails to be sent out to all users or to particular groups. And control what automated emails your users receive.',
  },
  helmetTitle: {
    id: 'app.containers.Admin.emails.helmetTitle',
    defaultMessage: 'Email Campaigns',
  },
  helmetDescription: {
    id: 'app.containers.Admin.emails.helmetDescription',
    defaultMessage:
      'Send out manual emails to certain citizen group and active automated campaigns',
  },
  campaignDeletionConfirmation: {
    id: 'app.containers.Admin.emails.campaignDeletionConfirmation',
    defaultMessage: 'Are you sure?',
  },
  addCampaignButton: {
    id: 'app.containers.Admin.emails.addCampaignButton',
    defaultMessage: 'Create campaign',
  },
  deleteButtonLabel: {
    id: 'app.containers.Admin.emails.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  statsButton: {
    id: 'app.containers.Admin.emails.statsButton',
    defaultMessage: 'Statistics',
  },
  editButtonLabel: {
    id: 'app.containers.Admin.emails.editButtonLabel',
    defaultMessage: 'Edit',
  },
  manageButtonLabel: {
    id: 'app.containers.Admin.emails.manageButtonLabel',
    defaultMessage: 'Manage & Edit & Preview & Delete',
  },
  fieldSender: {
    id: 'app.containers.Admin.emails.fieldSender',
    defaultMessage: 'From',
  },
  fieldSenderTooltip: {
    id: 'app.containers.Admin.emails.fieldSenderTooltip',
    defaultMessage: 'Choose whom users will see as the sender of the email.',
  },
  fieldReplyTo: {
    id: 'app.containers.Admin.emails.fieldReplyTo',
    defaultMessage: 'Replies should go to',
  },
  fieldReplyToTooltip: {
    id: 'app.containers.Admin.emails.fieldReplyToTooltip',
    defaultMessage:
      'Choose what email address should receive direct replies from users on your email.',
  },
  fieldTo: {
    id: 'app.containers.Admin.emails.fieldTo',
    defaultMessage: 'To',
  },
  fieldToTooltip: {
    id: 'app.containers.Admin.emails.fieldToTooltip',
    defaultMessage: 'Choose the group(s) of users who will receive your email.',
  },
  fieldSubject: {
    id: 'app.containers.Admin.emails.fieldSubject',
    defaultMessage: 'Email Subject',
  },
  fieldSubjectTooltip: {
    id: 'app.containers.Admin.emails.fieldSubjectTooltip',
    defaultMessage:
      'This will be shown in the subject line of the email and in the user’s inbox overview. Make it clear and engaging.',
  },
  fieldBody: {
    id: 'app.containers.Admin.emails.fieldBody',
    defaultMessage: 'Email Message',
  },
  addCampaignTitle: {
    id: 'app.containers.Admin.emails.addCampaignTitle',
    defaultMessage: 'New campaign',
  },
  editCampaignTitle: {
    id: 'app.containers.Admin.emails.editCampaignTitle',
    defaultMessage: 'Edit campaign',
  },
  draft: {
    id: 'app.containers.Admin.emails.draft',
    defaultMessage: 'Draft',
  },
  sent: {
    id: 'app.containers.Admin.emails.sent',
    defaultMessage: 'Sent',
  },
  sendNowButton: {
    id: 'app.containers.Admin.emails.sendNowButton',
    defaultMessage: 'Send now',
  },
  sendTestEmailButton: {
    id: 'app.containers.Admin.emails.sendTestEmailButton',
    defaultMessage: 'Send a preview',
  },
  sendTestEmailTooltip: {
    id: 'app.containers.Admin.emails.sendTestEmailTooltip',
    defaultMessage:
      'Send this draft email to the email address with which you are logged in, to check how it looks like in ‘real life’.',
  },
  previewSentConfirmation: {
    id: 'app.containers.Admin.emails.previewSentConfirmation',
    defaultMessage: 'A preview email has been sent to your email address',
  },
  formSaveButton: {
    id: 'app.containers.Admin.emails.formSaveButton',
    defaultMessage: 'Continue',
  },
  formErrorButton: {
    id: 'app.containers.Admin.emails.formErrorButton',
    defaultMessage: 'Continue',
  },
  formSuccessButton: {
    id: 'app.containers.Admin.emails.formSuccessButton',
    defaultMessage: 'Continue',
  },
  formSuccessMessage: {
    id: 'app.containers.Admin.emails.formSuccessMessage',
    defaultMessage: 'formSuccessMessage',
  },
  formErrorMessage: {
    id: 'app.containers.Admin.emails.formErrorMessage',
    defaultMessage: 'Please correct the errors above to continue',
  },
  formUnexpectedErrorMessage: {
    id: 'app.containers.Admin.emails.formUnexpectedErrorMessage',
    defaultMessage: 'Something went wrong, please try again later',
  },
  previewTitle: {
    id: 'app.containers.Admin.emails.previewTitle',
    defaultMessage: 'Preview',
  },
  recipientsTitle: {
    id: 'app.containers.Admin.emails.recipientsTitle',
    defaultMessage: 'Recipients',
  },
  deliveryStatus_sent: {
    id: 'app.containers.Admin.Campaigns.deliveryStatus_sent',
    defaultMessage: 'Sent',
  },
  deliveryStatus_failed: {
    id: 'app.containers.Admin.Campaigns.deliveryStatus_failed',
    defaultMessage: 'Failed',
  },
  deliveryStatus_accepted: {
    id: 'app.containers.Admin.Campaigns.deliveryStatus_accepted',
    defaultMessage: 'Accepted',
  },
  deliveryStatus_delivered: {
    id: 'app.containers.Admin.Campaigns.deliveryStatus_delivered',
    defaultMessage: 'Delivered',
  },
  deliveryStatus_opened: {
    id: 'app.containers.Admin.Campaigns.deliveryStatus_opened',
    defaultMessage: 'Opened',
  },
  deliveryStatus_clicked: {
    id: 'app.containers.Admin.Campaigns.deliveryStatus_clicked',
    defaultMessage: 'Clicked',
  },
  deliveryStatus_clickedTooltip: {
    id: 'app.containers.Admin.Campaigns.deliveryStatus_clickedTooltip',
    defaultMessage:
      'When you added one or more links to your email, the number of users who clicked a link will be shown here.',
  },
  tabCustom: {
    id: 'app.containers.Admin.Campaigns.tabCustom',
    defaultMessage: 'Custom',
  },
  tabAutomated: {
    id: 'app.containers.Admin.Campaigns.tabAutomated',
    defaultMessage: 'Automated',
  },
  campaignFrom: {
    id: 'app.containers.Admin.Campaigns.campaignFrom',
    defaultMessage: 'From:',
  },
  campaignTo: {
    id: 'app.containers.Admin.Campaigns.campaignTo',
    defaultMessage: 'To:',
  },
  noAccess: {
    id: 'app.containers.Admin.Campaigns.noAccess',
    defaultMessage:
      "We're sorry, but it seems like you don't have access to the emails section",
  },
  deleteCampaignButton: {
    id: 'app.containers.Admin.emails.deleteCampaignButton',
    defaultMessage: 'Delete Campaign',
  },
  noCampaignsHeader: {
    id: 'app.containers.Admin.emails.noCampaignsHeader',
    defaultMessage: 'No custom email campaigns yet',
  },
  noCampaignsDescription: {
    id: 'app.containers.Admin.emails.noCampaignsDescription',
    defaultMessage:
      'Custom email campaigns are emails created from scratch. Their content and recipients can be chosen and you can follow up on their results through statistics.',
  },
  automatedEmailCampaignsInfo: {
    id: 'app.containers.Admin.emails.automatedEmailCampaignsInfo',
    defaultMessage:
      'Automated email campaigns are sent out by default and are triggered by a user’s actions. Some of them can be turned off. Others are an inherent part of user interactions with the platform and therefore can’t be turned off.',
  },
  allUsers: {
    id: 'app.containers.Admin.emails.allUsers',
    defaultMessage: 'All users',
  },
  groups: {
    id: 'app.containers.Admin.emails.groups',
    defaultMessage: 'Groups',
  },
  nameVariablesInfo: {
    id: 'app.containers.Admin.emails.nameVariablesInfo',
    defaultMessage:
      'You can speak directly to citizens using the variables \\{\\{first_name\\}\\} \\{\\{last_name\\}\\}. E.g. "Dear \\{\\{first_name\\}\\} \\{\\{last_name\\}\\}, ..."',
  },
  changeRecipientsButton: {
    id: 'app.containers.Admin.emails.changeRecipientsButton',
    defaultMessage: 'Change recipients',
  },
  send: {
    id: 'app.containers.Admin.emails.send',
    defaultMessage: 'Send',
  },
  confirmSendHeader: {
    id: 'app.containers.Admin.emails.confirmSendHeader',
    defaultMessage: 'Email to all users?',
  },
  toAllUsers: {
    id: 'app.containers.Admin.emails.toAllUsers',
    defaultMessage: 'Do you want to send this email to all users?',
  },
  senderRecipients: {
    id: 'app.containers.Admin.emails.senderRecipients',
    defaultMessage: 'Sender and recipients',
  },
});
