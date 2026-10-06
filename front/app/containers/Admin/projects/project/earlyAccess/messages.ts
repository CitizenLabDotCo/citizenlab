import { defineMessages } from 'react-intl';

export default defineMessages({
  dismiss: {
    id: 'app.containers.Admin.projects.project.earlyAccess.dismiss',
    defaultMessage: 'Dismiss',
  },
  profileSettingsLink: {
    id: 'app.containers.Admin.projects.project.earlyAccess.profileSettingsLink',
    defaultMessage: 'profile settings',
  },
  turnOnNotice: {
    id: 'app.containers.Admin.projects.project.earlyAccess.turnOnNotice',
    defaultMessage:
      '<b>Try the new project back office.</b> It is in internal early access for Go Vocal staff only. Turn it on under "Early access" in your {profileSettingsLink}. You can turn it off again there at any time.',
  },
  feedbackNotice: {
    id: 'app.containers.Admin.projects.project.earlyAccess.feedbackNotice',
    defaultMessage:
      '<b>You are using the new project back office.</b> It is a work in progress, so expect rough edges. Your feedback is valuable at any point: share it in the #dev-tandem-uxui-revamp Slack channel. To go back to the current back office, turn it off under "Early access" in your {profileSettingsLink}.',
  },
});
