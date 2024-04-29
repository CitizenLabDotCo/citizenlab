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
  customEmails: {
    id: 'app.containers.Admin.Campaigns.customEmails',
    defaultMessage: 'Custom emails',
  },
  customEmailsDescription: {
    id: 'app.containers.Admin.Campaigns.customEmailsDescription',
    defaultMessage: 'Send out custom emails and check statistics.',
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
  noCampaignsHeader: {
    id: 'app.containers.Admin.emails.noCampaignsHeader',
    defaultMessage: 'No custom email campaigns yet',
  },
  message: {
    id: 'app.containers.Admin.emails.message',
    defaultMessage: 'Message',
  },
  dateSent: {
    id: 'app.containers.Admin.emails.dateSent',
    defaultMessage: 'Date sent',
  },
  recipients: {
    id: 'app.containers.Admin.emails.recipients',
    defaultMessage: 'Recipients',
  },
  status: {
    id: 'app.containers.Admin.emails.status',
    defaultMessage: 'Status',
  },
  noCampaignsDescription: {
    id: 'app.containers.Admin.emails.noCampaignsDescription',
    defaultMessage:
      'Custom email campaigns are emails created from scratch. Their content and recipients can be chosen and you can follow up on their results through statistics.',
  },
  sentToUsers: {
    id: 'app.containers.Admin.emails.sentToUsers',
    defaultMessage: 'These are emails sent to users',
  },
  subject: {
    id: 'app.containers.Admin.emails.subject',
    defaultMessage: 'Subject:',
  },
  from: {
    id: 'app.containers.Admin.emails.from',
    defaultMessage: 'From:',
  },
  to: {
    id: 'app.containers.Admin.emails.to',
    defaultMessage: 'To:',
  },
  nameVariablesInfo: {
    id: 'app.containers.Admin.emails.nameVariablesInfo2',
    defaultMessage:
      'You can speak directly to citizens using the variables {firstName} {lastName}. E.g. "Dear {firstName} {lastName}, ..."',
  },
  send: {
    id: 'app.containers.Admin.emails.send',
    defaultMessage: 'Send',
  },
  senderRecipients: {
    id: 'app.containers.Admin.emails.senderRecipients',
    defaultMessage: 'Sender and recipients',
  },
});
