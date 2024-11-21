import { MessageDescriptor } from 'react-intl';
import { RouteType } from 'routes';
import { FormatMessage } from 'typings';

import messages from './messages';

type TabRoute = {
  message: MessageDescriptor;
  name: string;
  url: RouteType;
};

const BASE_ADMIN_TABS: TabRoute[] = [
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
  {
    message: messages.tabVisitors,
    name: 'visitors',
    url: '/admin/dashboard/visitors',
  },
  {
    message: messages.tabRepresentativeness,
    name: 'representativeness',
    url: '/admin/dashboard/representation',
  },
];

const MODERATION_TAB: TabRoute = {
  message: messages.feed,
  name: 'moderation',
  url: '/admin/dashboard/moderation',
};

const MANAGEMENT_FEED_TAB: TabRoute = {
  message: messages.managementFeed,
  name: 'management_feed',
  url: '/admin/dashboard/management-feed',
};

export const getAdminTabs = (
  { moderationEnabled, managementFeedAllowedAndDisabled },
  formatMessage: FormatMessage
) => {
  const tabs = [...BASE_ADMIN_TABS];

  if (moderationEnabled) {
    tabs.push(MODERATION_TAB);
  }

  if (!managementFeedAllowedAndDisabled) {
    tabs.push(MANAGEMENT_FEED_TAB);
  }

  return translateTabs(tabs, formatMessage);
};

type UntranslatedTab = {
  message: MessageDescriptor;
  name: string;
  url: RouteType;
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
