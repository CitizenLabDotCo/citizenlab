import { MessageDescriptor } from 'react-intl';
import messages from './messages';
import { FormatMessage } from 'typings';

const BASE_ADMIN_TABS = [
  {
    message: messages.tabOverview,
    url: '/admin/dashboard/overview',
    name: 'overview',
  },
  {
    message: messages.tabUsers,
    url: '/admin/dashboard/users',
    name: 'users',
  },
];

const VISITORS_TAB = {
  message: messages.tabVisitors,
  name: 'visitors',
  url: '/admin/dashboard/visitors',
};

const REPRESENTATIVENESS_TAB = {
  message: messages.tabRepresentativeness,
  name: 'representativeness',
  url: '/admin/dashboard/representation',
};

const MODERATION_TAB = {
  message: messages.feed,
  name: 'moderation',
  url: '/admin/dashboard/moderation',
};

export const getAdminTabs = (
  { visitorsEnabled, representativenessEnabled, moderationEnabled },
  formatMessage: FormatMessage
) => {
  const tabs = [...BASE_ADMIN_TABS];

  if (visitorsEnabled) {
    tabs.push(VISITORS_TAB);
  }

  if (representativenessEnabled) {
    tabs.push(REPRESENTATIVENESS_TAB);
  }

  if (moderationEnabled) {
    tabs.push(MODERATION_TAB);
  }

  return translateTabs(tabs, formatMessage);
};

type UntranslatedTab = {
  message: MessageDescriptor;
  name: string;
  url: string;
};

const translateTabs = (
  untranslatedTabs: UntranslatedTab[],
  formatMessage: FormatMessage
) => {
  return untranslatedTabs.map((tab) => ({
    label: formatMessage(tab.message),
    name: tab.name,
    url: tab.url,
  }));
};
