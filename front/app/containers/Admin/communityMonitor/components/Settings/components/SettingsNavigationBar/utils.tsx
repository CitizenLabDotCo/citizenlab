import { FormatMessage, ITab } from 'typings';

import messages from '../../messages';

export const getSettingsTabs = (formatMessage: FormatMessage): ITab[] => {
  return [
    {
      name: 'survey',
      label: formatMessage(messages.surveySettings),
      url: `/admin/community-monitor/settings/survey`,
    },
    {
      name: 'popup',
      label: formatMessage(messages.popupSettings),
      url: `/admin/community-monitor/settings/popup`,
    },
    {
      name: 'access_rights',
      label: formatMessage(messages.accessRights),
      url: `/admin/community-monitor/settings/access-rights`,
    },
    {
      name: 'moderator_management',
      label: formatMessage(messages.management),
      url: `/admin/community-monitor/settings/moderators`,
    },
  ];
};
