/*
 * Admin.emails Messages
 *
 * This contains all the text for the admins email.
 */

import { defineMessages } from 'react-intl';

export default defineMessages({
  helmetTitle: {
    id: 'app.containers.Admin.messaging.helmetTitle',
    defaultMessage: 'Messaging',
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
  addTextButton: {
    id: 'app.containers.Admin.emails.addTextButton',
    defaultMessage: 'Create a new SMS',
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
  fieldSenderError: {
    id: 'app.containers.Admin.emails.fieldSenderError',
    defaultMessage: 'Provide a sender of the email',
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
  fieldReplyToEmailError: {
    id: 'app.containers.Admin.emails.fieldReplyToEmailError',
    defaultMessage:
      'Provide an email address in the correct format, for example name@provider.com',
  },
  fieldReplyToError: {
    id: 'app.containers.Admin.emails.fieldReplyToError',
    defaultMessage: 'Provide an email address',
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
  fieldSubjectError: {
    id: 'app.containers.Admin.emails.fieldSubjectError',
    defaultMessage: 'Provide an email subject for all languages',
  },
  fieldBody: {
    id: 'app.containers.Admin.emails.fieldBody',
    defaultMessage: 'Email Message',
  },
  fieldBodyError: {
    id: 'app.containers.Admin.emails.fieldBodyError',
    defaultMessage: 'Provide an email message for all languages',
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
  sending: {
    id: 'app.containers.Admin.emails.sending',
    defaultMessage: 'Sending',
  },
  sent: {
    id: 'app.containers.Admin.emails.sent',
    defaultMessage: 'Sent',
  },
  failed: {
    id: 'app.containers.Admin.emails.failed',
    defaultMessage: 'Failed',
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
  formSave: {
    id: 'app.containers.Admin.emails.formSave',
    defaultMessage: 'Save as draft',
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
  tabCustomEmail: {
    id: 'app.containers.Admin.Campaigns.tabCustomEmail1',
    defaultMessage: 'Custom emails',
  },
  tabAutomatedEmails: {
    id: 'app.containers.Admin.Campaigns.tabAutomatedEmails',
    defaultMessage: 'Automated emails',
  },
  tabTexting: {
    id: 'app.containers.Admin.Campaigns.tabTexting1',
    defaultMessage: 'Texting',
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
  noTextingCampaignsHeader: {
    id: 'app.containers.Admin.emails.noTextingCampaignsHeader',
    defaultMessage: 'No SMS has been drafted or sent yet',
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
