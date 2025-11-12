import { defineMessages } from 'react-intl';

export default defineMessages({
  deliveryStatus_failed: {
    id: 'app.components.Admin.Campaigns.deliveryStatus_failed',
    defaultMessage: 'Failed',
  },

  deliveryStatus_openedTooltip: {
    id: 'app.components.Admin.Campaigns.deliveryStatus_openedTooltip',
    defaultMessage:
      'This shows how many recipients opened the email. Please note that some security systems (like Microsoft Defender) may pre-load content for scanning, which can result in false opens.',
  },
  deliveryStatus_clickedTooltip: {
    id: 'app.components.Admin.Campaigns.deliveryStatus_clickedTooltip2',
    defaultMessage:
      'This shows how many recipients clicked a link in the email. Please note that some security systems may follow links automatically to scan them, which can result in false clicks.',
  },
  recipientsTitle: {
    id: 'app.components.Admin.Campaigns.recipientsTitle',
    defaultMessage: 'Recipients',
  },
  campaignDeletionConfirmation: {
    id: 'app.components.Admin.Campaigns.campaignDeletionConfirmation',
    defaultMessage: 'Are you sure?',
  },
  deleteCampaignButton: {
    id: 'app.components.Admin.Campaigns.deleteCampaignButton',
    defaultMessage: 'Delete campaign',
  },
  sent: {
    id: 'app.components.Admin.Campaigns.sent',
    defaultMessage: 'Sent',
  },
  statsButton: {
    id: 'app.components.Admin.Campaigns.statsButton',
    defaultMessage: 'Statistics',
  },
  draft: {
    id: 'app.components.Admin.Campaigns.draft',
    defaultMessage: 'Draft',
  },
  manageButtonLabel: {
    id: 'app.components.Admin.Campaigns.manageButtonLabel',
    defaultMessage: 'Manage',
  },
  opened: {
    id: 'app.components.Admin.Campaigns.opened',
    defaultMessage: 'Opened',
  },
  clicked: {
    id: 'app.components.Admin.Campaigns.clicked',
    defaultMessage: 'Clicked',
  },
  project: {
    id: 'app.components.Admin.Campaigns.project',
    defaultMessage: 'Project',
  },
  to: {
    id: 'app.components.Admin.Campaigns.to',
    defaultMessage: 'To',
  },
  from: {
    id: 'app.components.Admin.Campaigns.from',
    defaultMessage: 'From',
  },
  reply_to: {
    id: 'app.components.Admin.Campaigns.reply_to',
    defaultMessage: 'Reply-To',
  },
  subject: {
    id: 'app.components.Admin.Campaigns.subject',
    defaultMessage: 'Subject',
  },
});
