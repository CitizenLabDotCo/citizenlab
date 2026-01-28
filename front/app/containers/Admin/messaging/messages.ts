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
  addCampaignButton: {
    id: 'app.containers.Admin.emails.addCampaign',
    defaultMessage: 'Create email',
  },
  deleteButtonLabel: {
    id: 'app.containers.Admin.emails.deleteButtonLabel',
    defaultMessage: 'Delete',
  },
  editButtonLabel: {
    id: 'app.containers.Admin.emails.editButtonLabel',
    defaultMessage: 'Edit',
  },
  editDisabledTooltip: {
    id: 'app.containers.Admin.emails.editDisabledTooltip2',
    defaultMessage: 'Coming soon: This email cannot currently be edited.',
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
  fieldGroupContent: {
    id: 'app.containers.Admin.emails.fieldGroupContent',
    defaultMessage: 'Email Content',
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
    id: 'app.containers.Admin.emails.sendTestEmailTooltip2',
    defaultMessage:
      'When you click this link, a test email will be sent to your email address only. This allows you to check what the email looks like in ‘real life’.',
  },
  preview: {
    id: 'app.containers.Admin.emails.preview',
    defaultMessage: 'Preview',
  },
  previewSentConfirmation: {
    id: 'app.containers.Admin.emails.previewSentConfirmation',
    defaultMessage: 'A preview email has been sent to your email address',
  },
  emailUpdated: {
    id: 'app.containers.Admin.emails.emailUpdated',
    defaultMessage: 'Email successfully updated',
  },
  emailCreated: {
    id: 'app.containers.Admin.emails.emailCreated',
    defaultMessage: 'Email successfully created in draft',
  },
  formSave: {
    id: 'app.containers.Admin.emails.formSave',
    defaultMessage: 'Save',
  },
  formSaveAsDraft: {
    id: 'app.containers.Admin.emails.formSaveAsDraft',
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
  tabAutomatedEmails: {
    id: 'app.containers.Admin.Campaigns.tabAutomatedEmails',
    defaultMessage: 'Automated emails',
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
    id: 'app.containers.Admin.emails.emptyCampaignsHeader',
    defaultMessage: 'Send your first email',
  },
  noCampaignsDescription: {
    id: 'app.containers.Admin.emails.emptyCampaignsDescription',
    defaultMessage:
      'Easily connect with your participants by sending them emails. Choose who to contact and track your engagement.',
  },
  automatedEmailCampaignsInfo: {
    id: 'app.containers.Admin.emails.automatedEmailCampaignsInfo1',
    defaultMessage:
      "Automated emails are automatically sent out and are triggered by a user's actions. You can turn some of them off for all users of your platform. The other automated emails can not be turned off because they are required for the proper functioning of your platform.",
  },
  automatedEmails: {
    id: 'app.containers.Admin.emails.automatedEmails',
    defaultMessage: 'Automated emails',
  },
  automatedEmailsRecipients: {
    id: 'app.containers.Admin.emails.automatedEmailsRecipients',
    defaultMessage: 'Users who will receive this email',
  },
  automatedEmailsTriggers: {
    id: 'app.containers.Admin.emails.automatedEmailsTriggers',
    defaultMessage: 'Event that triggers this email',
  },
  automatedEmailsDigest: {
    id: 'app.containers.Admin.emails.automatedEmailsDigest',
    defaultMessage: 'The email will only be sent if there is content',
  },
  allUsers: {
    id: 'app.containers.Admin.emails.allUsers',
    defaultMessage: 'All users',
  },
  groups: {
    id: 'app.containers.Admin.emails.groups',
    defaultMessage: 'Groups',
  },
  viewExample: {
    id: 'app.containers.Admin.emails.viewExample',
    defaultMessage: 'View',
  },
  clickOnButtonForExamples: {
    id: 'app.containers.Admin.emails.clickOnButtonForExamples',
    defaultMessage:
      'Click on the button below to check examples of this email on our support page. ',
  },
  seeEmailHereText: {
    id: 'app.containers.Admin.emails.seeEmailHereText',
    defaultMessage:
      "As soon as an email of this type is sent you'll be able to check it here.",
  },
  supportButtonLabel: {
    id: 'app.containers.Admin.emails.supportButtonLabel',
    defaultMessage: 'See examples on our support page',
  },
  supportButtonLink3: {
    id: 'app.containers.Admin.emails.supportButtonLink3',
    defaultMessage:
      'https://support.govocal.com/en/articles/527592-changing-the-settings-of-the-automated-email-notifications',
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
  allParticipantsInProject: {
    id: 'app.containers.Admin.emails.allParticipantsInProject',
    defaultMessage: 'All participants in project',
  },
  editModalTitle: {
    id: 'app.containers.Admin.messaging.automated.editModalTitle',
    defaultMessage: 'Edit campaign fields',
  },
  variablesToolTip: {
    id: 'app.containers.Admin.messaging.automated.variablesToolTip',
    defaultMessage: 'You can use the following variables in your message:',
  },
  regionMultilocError: {
    id: 'app.containers.Admin.emails.regionMultilocError',
    defaultMessage: 'Please provide a value for all languages',
  },
  editRegion_subject_multiloc: {
    id: 'app.containers.Admin.emails.editRegion_subject_multiloc',
    defaultMessage: 'Subject',
  },
  editRegion_title_multiloc: {
    id: 'app.containers.Admin.emails.editRegion_title_multiloc',
    defaultMessage: 'Title',
  },
  editRegion_intro_multiloc: {
    id: 'app.containers.Admin.emails.editRegion_intro_multiloc',
    defaultMessage: 'Introduction',
  },
  editRegion_button_text_multiloc: {
    id: 'app.containers.Admin.emails.editRegion_button_text_multiloc',
    defaultMessage: 'Button text',
  },
});
