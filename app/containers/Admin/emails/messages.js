/*
 * Admin.emails Messages
 *
 * This contains all the text for the admins email.
 */

import { defineMessages } from 'react-intl';

export default defineMessages({
  titleEmails: {
    id: 'app.containers.Admin.emails.titleEmails',
    defaultMessage: 'E-mails',
  },
  helmetTitle: {
    id: 'app.containers.Admin.emails.helmetTitle',
    defaultMessage: 'E-mails',
  },
  helmetDescription: {
    id: 'app.containers.Admin.emails.helmetDescription',
    defaultMessage: 'Send out manual emails to certain citizen group and active automated campaigns',
  },
  listTitle: {
    id: 'app.containers.Admin.emails.listTitle',
    defaultMessage: 'Email Campaigns',
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
    defaultMessage: 'Manage',
  },
  fieldSender: {
    id: 'app.containers.Admin.emails.fieldSender',
    defaultMessage: 'From',
  },
  fieldReplyTo: {
    id: 'app.containers.Admin.emails.fieldReplyTo',
    defaultMessage: 'Replies should go to',
  },
  fieldTo: {
    id: 'app.containers.Admin.emails.fieldTo',
    defaultMessage: 'To',
  },
  fieldSubject: {
    id: 'app.containers.Admin.emails.fieldSubject',
    defaultMessage: 'Email Subject',
  },
  fieldBody: {
    id: 'app.containers.Admin.emails.fieldBody',
    defaultMessage: 'Email Message',
  },
  addCampaignTitle: {
    id: 'app.containers.Admin.emails.addCampaignTitle',
    defaultMessage: 'New campaign',
  },
  formTitleWho: {
    id: 'app.containers.Admin.emails.formTitleWho',
    defaultMessage: 'Who',
  },
  formTitleWhat: {
    id: 'app.containers.Admin.emails.formTitleWhat',
    defaultMessage: 'What',
  },
  formTitleWhen: {
    id: 'app.containers.Admin.emails.formTitleWhen',
    defaultMessage: 'When',
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
  sendPreviewButton: {
    id: 'app.containers.Admin.emails.sendPreviewButton',
    defaultMessage: 'Send me a preview',
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
  deliveryStatus_bounced: {
    id: 'app.containers.Admin.Campaigns.deliveryStatus_bounced',
    defaultMessage: 'Bounced',
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
  tabManual: {
    id: 'app.containers.Admin.Campaigns.tabManual',
    defaultMessage: 'Manual',
  },
  tabAutomated: {
    id: 'app.containers.Admin.Campaigns.tabAutomated',
    defaultMessage: 'Automated',
  },
  noAccess: {
    id: 'app.containers.Admin.Campaigns.noAccess',
    defaultMessage: 'We\'re sorry, but it seems like you don\'t have access to the e-mails section',
  },
});
