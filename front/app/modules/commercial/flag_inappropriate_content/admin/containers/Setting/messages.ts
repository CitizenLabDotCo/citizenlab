import { defineMessages } from 'react-intl';

export default defineMessages({
  inappropriateContentDetectionSetting: {
    id: 'app.containers.AdminPage.SettingsPage.inappropriateContentDetectionSetting',
    defaultMessage: 'Detect inappropriate content',
  },
  inappropriateContentDetectionSettingDescription: {
    id: 'app.containers.AdminPage.SettingsPage.inappropriateContentDetectionSettingDescription',
    defaultMessage: 'Auto-detect inappropriate content posted on the platform.',
  },
  inappropriateContentDetectionTooltip: {
    id: 'app.containers.AdminPage.SettingsPage.inappropriateContentDetectionTooltip',
    defaultMessage:
      'While this feature is enabled, input, proposals and comments posted by participants will be automatically reviewed. Posts flagged as potentially containing inappropriate content will not be blocked, but will be highlighted for review on the {linkToActivityPage} page.',
  },
  linkToActivityPageText: {
    id: 'app.containers.AdminPage.SettingsPage.linkToActivityPageText',
    defaultMessage: 'Activity',
  },
});
