import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.Admin.tools.webhooks.title',
    defaultMessage: 'Webhooks',
  },
  description: {
    id: 'app.containers.Admin.tools.webhooks.description',
    defaultMessage:
      'Configure webhooks to receive real-time notifications when events occur on your platform. For more information, see our {webhookDocumentationLink}.',
  },
  webhookDocumentationLink: {
    id: 'app.containers.Admin.tools.webhooks.webhookDocumentationLink',
    defaultMessage: 'webhook documentation',
  },
  documentationUrl: {
    id: 'app.containers.Admin.tools.webhooks.documentationUrl',
    defaultMessage: 'https://developers.citizenlab.co/webhooks',
  },
  name: {
    id: 'app.containers.Admin.tools.webhooks.name',
    defaultMessage: 'Name',
  },
  url: {
    id: 'app.containers.Admin.tools.webhooks.url',
    defaultMessage: 'URL',
  },
  events: {
    id: 'app.containers.Admin.tools.webhooks.events',
    defaultMessage: 'Events',
  },
  project: {
    id: 'app.containers.Admin.tools.webhooks.project',
    defaultMessage: 'Project',
  },
  allProjects: {
    id: 'app.containers.Admin.tools.webhooks.allProjects',
    defaultMessage: 'All projects',
  },
  enabled: {
    id: 'app.containers.Admin.tools.webhooks.enabled',
    defaultMessage: 'Enabled',
  },
  deliveryStats: {
    id: 'app.containers.Admin.tools.webhooks.deliveryStats',
    defaultMessage: 'Deliveries',
  },
  actions: {
    id: 'app.containers.Admin.tools.webhooks.actions',
    defaultMessage: 'Actions',
  },
  createWebhookButton: {
    id: 'app.containers.Admin.tools.webhooks.createWebhookButton',
    defaultMessage: 'Create webhook',
  },
  noWebhooks: {
    id: 'app.containers.Admin.tools.webhooks.noWebhooks',
    defaultMessage: 'You do not have any webhooks yet.',
  },
  delete: {
    id: 'app.containers.Admin.tools.webhooks.delete',
    defaultMessage: 'Delete webhook',
  },
  deleteConfirmation: {
    id: 'app.containers.Admin.tools.webhooks.deleteConfirmation',
    defaultMessage:
      'Are you sure you want to delete this webhook? This will also delete all associated deliveries.',
  },
  edit: {
    id: 'app.containers.Admin.tools.webhooks.edit',
    defaultMessage: 'Edit webhook',
  },
  viewDeliveries: {
    id: 'app.containers.Admin.tools.webhooks.viewDeliveries',
    defaultMessage: 'View deliveries',
  },
  regenerateSecret: {
    id: 'app.containers.Admin.tools.webhooks.regenerateSecret',
    defaultMessage: 'Regenerate secret',
  },
  regenerateSecretConfirmation: {
    id: 'app.containers.Admin.tools.webhooks.regenerateSecretConfirmation',
    defaultMessage:
      'Are you sure you want to regenerate the secret token? The old token will stop working immediately.',
  },
  succeeded: {
    id: 'app.containers.Admin.tools.webhooks.succeeded',
    defaultMessage: 'succeeded',
  },
  failed: {
    id: 'app.containers.Admin.tools.webhooks.failed',
    defaultMessage: 'failed',
  },
  pending: {
    id: 'app.containers.Admin.tools.webhooks.pending',
    defaultMessage: 'pending',
  },
  createdAt: {
    id: 'app.containers.Admin.tools.webhooks.createdAt',
    defaultMessage: 'Created',
  },
  createWebhookTitle: {
    id: 'app.containers.Admin.tools.webhooks.createWebhookTitle',
    defaultMessage: 'Create a new webhook',
  },
  createWebhookDescription: {
    id: 'app.containers.Admin.tools.webhooks.createWebhookDescription',
    defaultMessage:
      'Create a webhook to receive real-time notifications when events occur on your platform. For more information, see our {webhookDocumentationLink}.',
  },
  webhookName: {
    id: 'app.containers.Admin.tools.webhooks.webhookName',
    defaultMessage: 'Name',
  },
  webhookNamePlaceholder: {
    id: 'app.containers.Admin.tools.webhooks.webhookNamePlaceholder',
    defaultMessage: 'Give your webhook a name',
  },
  webhookUrl: {
    id: 'app.containers.Admin.tools.webhooks.webhookUrl',
    defaultMessage: 'URL',
  },
  webhookUrlPlaceholder: {
    id: 'app.containers.Admin.tools.webhooks.webhookUrlPlaceholder',
    defaultMessage: 'https://your-domain.com/webhook',
  },
  webhookEvents: {
    id: 'app.containers.Admin.tools.webhooks.webhookEvents',
    defaultMessage: 'Events',
  },
  webhookEventsPlaceholder: {
    id: 'app.containers.Admin.tools.webhooks.webhookEventsPlaceholder',
    defaultMessage: 'Select events to subscribe to',
  },
  webhookProject: {
    id: 'app.containers.Admin.tools.webhooks.webhookProject',
    defaultMessage: 'Project',
  },
  webhookEnabled: {
    id: 'app.containers.Admin.tools.webhooks.webhookEnabled',
    defaultMessage: 'Enabled',
  },
  createButton: {
    id: 'app.containers.Admin.tools.webhooks.createButton',
    defaultMessage: 'Create webhook',
  },
  cancel: {
    id: 'app.containers.Admin.tools.webhooks.cancel',
    defaultMessage: 'Cancel',
  },
  createSuccess: {
    id: 'app.containers.Admin.tools.webhooks.createSuccess',
    defaultMessage: 'Webhook created successfully',
  },
  createSuccessDescription: {
    id: 'app.containers.Admin.tools.webhooks.createSuccessDescription',
    defaultMessage:
      'You can use the secret token below to verify whether requests to your webhook URL are coming from us. For more information, see our {webhookDocumentationLink}.',
  },
  createSuccessImportant: {
    id: 'app.containers.Admin.tools.webhooks.createSuccessImportant',
    defaultMessage:
      '<b>Important!</b> You can only copy this secret token once. If you close this window you will not be able to see it again.',
  },
  secretToken: {
    id: 'app.containers.Admin.tools.webhooks.secretToken',
    defaultMessage: 'secret token',
  },
  copySecret: {
    id: 'app.containers.Admin.tools.webhooks.copySecret',
    defaultMessage: 'Copy secret token',
  },
  copiedSuccess: {
    id: 'app.containers.Admin.tools.webhooks.copiedSuccess',
    defaultMessage: 'Copied!',
  },
  close: {
    id: 'app.containers.Admin.tools.webhooks.close',
    defaultMessage: 'Close',
  },
  nameRequired: {
    id: 'app.containers.Admin.tools.webhooks.nameRequired',
    defaultMessage: 'Name is required',
  },
  urlRequired: {
    id: 'app.containers.Admin.tools.webhooks.urlRequired',
    defaultMessage: 'URL is required',
  },
  urlInvalid: {
    id: 'app.containers.Admin.tools.webhooks.urlInvalid',
    defaultMessage: 'Please enter a valid URL',
  },
  eventsRequired: {
    id: 'app.containers.Admin.tools.webhooks.eventsRequired',
    defaultMessage: 'Please select at least one event',
  },
  editWebhookTitle: {
    id: 'app.containers.Admin.tools.webhooks.editWebhookTitle',
    defaultMessage: 'Edit webhook',
  },
  editWebhookDescription: {
    id: 'app.containers.Admin.tools.webhooks.editWebhookDescription',
    defaultMessage: 'Update the configuration of this webhook.',
  },
  updateButton: {
    id: 'app.containers.Admin.tools.webhooks.updateButton',
    defaultMessage: 'Update webhook',
  },
  deliveriesTitle: {
    id: 'app.containers.Admin.tools.webhooks.deliveriesTitle',
    defaultMessage: 'Deliveries for {name}',
  },
  deliveriesDescription: {
    id: 'app.containers.Admin.tools.webhooks.deliveriesDescription',
    defaultMessage: 'View and replay webhook deliveries.',
  },
  noDeliveries: {
    id: 'app.containers.Admin.tools.webhooks.noDeliveries',
    defaultMessage: 'No deliveries yet.',
  },
  status: {
    id: 'app.containers.Admin.tools.webhooks.status',
    defaultMessage: 'Status',
  },
  eventType: {
    id: 'app.containers.Admin.tools.webhooks.eventType',
    defaultMessage: 'Event',
  },
  attempts: {
    id: 'app.containers.Admin.tools.webhooks.attempts',
    defaultMessage: 'Attempts',
  },
  responseCode: {
    id: 'app.containers.Admin.tools.webhooks.responseCode',
    defaultMessage: 'Response code',
  },
  replay: {
    id: 'app.containers.Admin.tools.webhooks.replay',
    defaultMessage: 'Replay delivery',
  },
  viewDetails: {
    id: 'app.containers.Admin.tools.webhooks.viewDetails',
    defaultMessage: 'View details',
  },
  hideDetails: {
    id: 'app.containers.Admin.tools.webhooks.hideDetails',
    defaultMessage: 'Hide details',
  },
  responseBody: {
    id: 'app.containers.Admin.tools.webhooks.responseBody',
    defaultMessage: 'Response body',
  },
  errorMessage: {
    id: 'app.containers.Admin.tools.webhooks.errorMessage',
    defaultMessage: 'Error message',
  },
  lastAttempt: {
    id: 'app.containers.Admin.tools.webhooks.lastAttempt',
    defaultMessage: 'Last attempt',
  },
  succeededAt: {
    id: 'app.containers.Admin.tools.webhooks.succeededAt',
    defaultMessage: 'Succeeded at',
  },
  newSecretTitle: {
    id: 'app.containers.Admin.tools.webhooks.newSecretTitle',
    defaultMessage: 'New secret token',
  },
});
