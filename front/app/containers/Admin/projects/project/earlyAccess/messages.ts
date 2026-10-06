import { defineMessages } from 'react-intl';

export default defineMessages({
  profileSettingsLink: {
    id: 'app.containers.Admin.projects.project.earlyAccess.profileSettingsLink',
    defaultMessage: 'profile settings',
  },
  turnOnNoticeTitle: {
    id: 'app.containers.Admin.projects.project.earlyAccess.turnOnNoticeTitle',
    defaultMessage: 'Try the new project back office.',
  },
  turnOnNoticeDescription: {
    id: 'app.containers.Admin.projects.project.earlyAccess.turnOnNoticeDescription',
    defaultMessage:
      'It is in internal early access for Go Vocal staff only. Turn it on under "Early access" in your {profileSettingsLink}. You can turn it off again there at any time.',
  },
  feedbackNoticeTitle: {
    id: 'app.containers.Admin.projects.project.earlyAccess.feedbackNoticeTitle',
    defaultMessage: 'You are using the new project back office.',
  },
  feedbackNoticeDescription: {
    id: 'app.containers.Admin.projects.project.earlyAccess.feedbackNoticeDescription',
    defaultMessage:
      'We are still improving it, and your feedback at any point helps shape it: share it in the {slackChannelLink} Slack channel. To go back to the current back office, turn it off under "Early access" in your {profileSettingsLink}.',
  },
});
