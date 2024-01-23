import { MessageDescriptor } from 'react-intl';
import messages from './messages';
import { FormatMessage } from 'typings';

export const BASE_MODERATOR_TABS = [
  {
    message: messages.tabOverview,
    url: '/admin/dashboard/overview',
    name: 'overview',
  },
];

const BASE_ADMIN_TABS = [
  ...BASE_MODERATOR_TABS,
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

export const getAdminTabs = ({
  visitorsEnabled,
  representativenessEnabled,
  moderationEnabled,
}) => {
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

  return tabs;
};

type UntranslatedTab = {
  message: MessageDescriptor;
  name: string;
  url: string;
};

export const translateTabs = (
  untranslatedTabs: UntranslatedTab[],
  formatMessage: FormatMessage
) => {
  return untranslatedTabs.map((tab) => ({
    label: formatMessage(tab.message),
    name: tab.name,
    url: tab.url,
  }));
};
