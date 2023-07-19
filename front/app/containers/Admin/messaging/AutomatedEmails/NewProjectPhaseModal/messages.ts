import { defineMessages } from 'react-intl';

export default defineMessages({
  turnEmailCampaignOn: {
    id: 'app.containers.Admin.messaging.newProjectPhaseModal.turnEmailCampaignOn',
    defaultMessage: 'Turn the new phase email campaign on?',
  },
  turnEmailCampaignOff: {
    id: 'app.containers.Admin.messaging.newProjectPhaseModal.turnEmailCampaignOff',
    defaultMessage: 'Turn the new phase email campaign off?',
  },
  enabledMessage: {
    id: 'app.containers.Admin.messaging.newProjectPhaseModal.enabledMessage',
    defaultMessage:
      "This will enable it for every phase. You can still disable it on a specific phase if this email isn't relevant within that context.",
  },
  disabledMessage: {
    id: 'app.containers.Admin.messaging.newProjectPhaseModal.disabledMessage',
    defaultMessage:
      "This will disable it on all projects, you can also disable the email on phase level if you don't want this.",
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
});
