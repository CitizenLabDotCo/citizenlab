import { defineMessages } from 'react-intl';

export default defineMessages({
  settings: {
    id: 'app.containers.Admin.communityMonitor.settings.settings',
    defaultMessage: 'Settings',
  },
  userAnonymityLabelMain: {
    id: 'app.containers.Admin.communityMonitor.settings.userAnonymityLabelMain',
    defaultMessage: 'Anonymize all user data',
  },
  userAnonymityLabelTooltip: {
    id: 'app.containers.Admin.communityMonitor.settings.userAnonymityLabelTooltip',
    defaultMessage:
      "Users will still need to comply with participation requirements under the 'Access Rights'. User profile data will not be available in the survey data export.",
  },
  userAnonymityLabelSubtext: {
    id: 'app.containers.Admin.communityMonitor.settings.userAnonymityLabelSubtext',
    defaultMessage:
      "All of the survey's inputs from users will be anonymized before being recorded",
  },
});
