import { defineMessages } from 'react-intl';

export default defineMessages({
  helmetTitle: {
    id: 'app.containers.Admin.project.messaging.helmetTitle',
    defaultMessage: 'Messaging',
  },
  helmetDescription: {
    id: 'app.containers.Admin.project.emails.helmetDescription',
    defaultMessage: 'Send out manual emails to project participants',
  },
  addCampaignButton: {
    id: 'app.containers.Admin.project.emails.addCampaign',
    defaultMessage: 'Create email',
  },
  deleteButtonLabel: {
    id: 'app.containers.Admin.project.emails.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.Admin.project.emails.editButtonLabel',
    defaultMessage: 'Edit',
  },
  fieldSender: {
    id: 'app.containers.Admin.project.emails.fieldSender',
    defaultMessage: 'From',
  },
  fieldSenderTooltip: {
    id: 'app.containers.Admin.project.emails.fieldSenderTooltip',
    defaultMessage: 'Choose whom users will see as the sender of the email.',
  },
  fieldSenderError: {
    id: 'app.containers.Admin.project.emails.fieldSenderError',
    defaultMessage: 'Provide a sender of the email',
  },
  fieldReplyTo: {
    id: 'app.containers.Admin.project.emails.fieldReplyTo',
    defaultMessage: 'Replies should go to',
  },
  fieldReplyToTooltip: {
    id: 'app.containers.Admin.project.emails.fieldReplyToTooltip',
    defaultMessage:
      'Choose what email address should receive direct replies from users on your email.',
  },
  fieldReplyToEmailError: {
    id: 'app.containers.Admin.project.emails.fieldReplyToEmailError',
    defaultMessage:
      'Provide an email address in the correct format, for example name@provider.com',
  },
  fieldReplyToError: {
    id: 'app.containers.Admin.project.emails.fieldReplyToError',
    defaultMessage: 'Provide an email address',
  },
  fieldTo: {
    id: 'app.containers.Admin.project.emails.fieldTo',
    defaultMessage: 'To',
  },
  allParticipantsAndFollowers: {
    id: 'app.containers.Admin.project.emails.allParticipantsAndFollowers',
    defaultMessage: 'All {participants} and followers from the project',
  },
  participants: {
    id: 'app.containers.Admin.project.emails.participants',
    defaultMessage: 'participants',
  },
  allParticipantsTooltip: {
    id: 'app.containers.Admin.project.emails.allParticipantsTooltipText2',
    defaultMessage:
      'This includes registered users that performed any action in the project. Unregistered or anonymized users are not included.',
  },
  infoboxModerator: {
    id: 'app.containers.Admin.project.emails.infoboxModeratorText',
    defaultMessage:
      'From the Project Messaging tab you can only email all project participants. Admins can send emails to other participants or subsets of users via the Platform Messaging tab.',
  },
  infoboxAdmin: {
    id: 'app.containers.Admin.project.emails.infoboxAdminText',
    defaultMessage:
      'From the Project Messaging tab you can only email all project participants.  To email other participants or subsets of users go to the {link} tab.',
  },
  infoboxLink: {
    id: 'app.containers.Admin.project.emails.infoboxLinkText',
    defaultMessage: 'Platform Messaging',
  },
  fieldSubject: {
    id: 'app.containers.Admin.project.emails.fieldSubject',
    defaultMessage: 'Email Subject',
  },
  fieldSubjectTooltip: {
    id: 'app.containers.Admin.project.emails.fieldSubjectTooltip',
    defaultMessage:
      'This will be shown in the subject line of the email and in the user’s inbox overview. Make it clear and engaging.',
  },
  fieldSubjectError: {
    id: 'app.containers.Admin.project.emails.fieldSubjectError',
    defaultMessage: 'Provide an email subject for all languages',
  },
  fieldBody: {
    id: 'app.containers.Admin.project.emails.fieldBody',
    defaultMessage: 'Email Message',
  },
  fieldBodyError: {
    id: 'app.containers.Admin.project.emails.fieldBodyError',
    defaultMessage: 'Provide an email message for all languages',
  },
  addCampaignTitle: {
    id: 'app.containers.Admin.project.emails.addCampaignTitle',
    defaultMessage: 'New campaign',
  },
  editCampaignTitle: {
    id: 'app.containers.Admin.project.emails.editCampaignTitle',
    defaultMessage: 'Edit campaign',
  },
  draft: {
    id: 'app.containers.Admin.project.emails.draft',
    defaultMessage: 'Draft',
  },
  sending: {
    id: 'app.containers.Admin.project.emails.sending',
    defaultMessage: 'Sending',
  },
  sent: {
    id: 'app.containers.Admin.project.emails.sent',
    defaultMessage: 'Sent',
  },
  failed: {
    id: 'app.containers.Admin.project.emails.failed',
    defaultMessage: 'Failed',
  },
  sendTestEmailButton: {
    id: 'app.containers.Admin.project.emails.sendTestEmailButton',
    defaultMessage: 'Send a preview',
  },
  sendTestEmailTooltip: {
    id: 'app.containers.Admin.project.emails.sendTestEmailTooltip',
    defaultMessage:
      'Send this draft email to the email address with which you are logged in, to check how it looks like in ‘real life’.',
  },
  previewSentConfirmation: {
    id: 'app.containers.Admin.project.emails.previewSentConfirmation',
    defaultMessage: 'A preview email has been sent to your email address',
  },
  formSave: {
    id: 'app.containers.Admin.project.emails.formSave',
    defaultMessage: 'Save as draft',
  },
  previewTitle: {
    id: 'app.containers.Admin.project.emails.previewTitle',
    defaultMessage: 'Preview',
  },
  customEmails: {
    id: 'app.containers.Admin.project.Campaigns.customEmails',
    defaultMessage: 'Custom emails',
  },
  customEmailsDescription: {
    id: 'app.containers.Admin.project.Campaigns.customEmailsDescription',
    defaultMessage: 'Send out custom emails and check statistics.',
  },
  campaignFrom: {
    id: 'app.containers.Admin.project.Campaigns.campaignFrom',
    defaultMessage: 'From:',
  },
  campaignTo: {
    id: 'app.containers.Admin.project.Campaigns.campaignTo',
    defaultMessage: 'To:',
  },
  noAccess: {
    id: 'app.containers.Admin.project.Campaigns.noAccess',
    defaultMessage:
      "We're sorry, but it seems like you don't have access to the emails section",
  },
  noCampaignsHeader: {
    id: 'app.containers.Admin.project.emails.emptyCampaignsHeader',
    defaultMessage: 'Send your first email',
  },
  message: {
    id: 'app.containers.Admin.project.emails.message',
    defaultMessage: 'Message',
  },
  dateSent: {
    id: 'app.containers.Admin.project.emails.dateSent',
    defaultMessage: 'Date sent',
  },
  recipients: {
    id: 'app.containers.Admin.project.emails.recipients',
    defaultMessage: 'Recipients',
  },
  status: {
    id: 'app.containers.Admin.project.emails.status',
    defaultMessage: 'Status',
  },
  noCampaignsDescription: {
    id: 'app.containers.Admin.project.emails.emptyCampaignsDescription',
    defaultMessage:
      'Easily connect with your participants by sending them emails. Choose who to contact and track your engagement.',
  },
  sentToUsers: {
    id: 'app.containers.Admin.project.emails.sentToUsers',
    defaultMessage: 'These are emails sent to users',
  },
  subject: {
    id: 'app.containers.Admin.project.emails.subject',
    defaultMessage: 'Subject:',
  },
  from: {
    id: 'app.containers.Admin.project.emails.from',
    defaultMessage: 'From:',
  },
  to: {
    id: 'app.containers.Admin.project.emails.to',
    defaultMessage: 'To:',
  },
  nameVariablesInfo: {
    id: 'app.containers.Admin.project.emails.nameVariablesInfo2',
    defaultMessage:
      'You can speak directly to citizens using the variables {firstName} {lastName}. E.g. "Dear {firstName} {lastName}, ..."',
  },
  send: {
    id: 'app.containers.Admin.project.emails.send',
    defaultMessage: 'Send',
  },
  senderRecipients: {
    id: 'app.containers.Admin.project.emails.senderRecipients',
    defaultMessage: 'Sender and recipients',
  },
  projectParticipants: {
    id: 'app.containers.Admin.project.emails.projectParticipants',
    defaultMessage: 'Project participants',
  },
});
