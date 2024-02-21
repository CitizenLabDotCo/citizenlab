import { defineMessages } from 'react-intl';

export default defineMessages({
  turnEmailCampaignOn: {
    id: 'app.containers.Admin.messaging.newProjectPhaseModal.turnEmailCampaignOn1',
    defaultMessage: 'Enable the {emailCampaignName} email campaign setting?',
  },
  turnEmailCampaignOff: {
    id: 'app.containers.Admin.messaging.newProjectPhaseModal.turnEmailCampaignOff1',
    defaultMessage:
      'Are you sure you want to disable the {emailCampaignName} email campaign setting?',
  },
  enabledMessage: {
    id: 'app.containers.Admin.messaging.newProjectPhaseModal.enabledMessage1',
    defaultMessage:
      'This will not automatically enable the {emailCampaignName} email campaign for existing project phases. Enabling this setting will only allow you to configure this email campaign for each phase.',
  },
  disabledMessage: {
    id: 'app.containers.Admin.messaging.newProjectPhaseModal.disabledMessage1',
    defaultMessage:
      "This will also disable the {emailCampaignName} email campaign for all existing project phases. You won't be able to configure this email campaign for any phase as long as this setting is disabled.",
  },
  cancel: {
    id: 'app.containers.Admin.messaging.newProjectPhaseModal.cancel',
    defaultMessage: 'Cancel',
  },
  turnOn: {
    id: 'app.containers.Admin.messaging.newProjectPhaseModal.turnOn',
    defaultMessage: 'Yes, turn on',
  },
  turnOff: {
    id: 'app.containers.Admin.messaging.newProjectPhaseModal.turnOff',
    defaultMessage: 'Yes, turn off',
  },
  alternatively: {
    id: 'app.containers.Admin.messaging.newProjectPhaseModal.alternatively',
    defaultMessage:
      'Alternatively, you can disable this email campaign for specific phases in the settings of each phase.',
  },
});
