import { MessageDescriptor } from 'react-intl';

import { TAppConfigurationSetting } from 'api/app_configuration/types';

import { WrapperTo } from 'utils/cl-router/Link';

import dashboardMessages from '../../dashboard/messages';
import invitationsMessages from '../../invitations/messages';
import messagingMessages from '../../messaging/messages';
import pagesMenuTabsMessages from '../../pagesAndMenu/components/PagesMenuTabs/messages';
import settingsMessages from '../../settings/messages';
import usersMessages from '../../users/messages';
import sidebarMessages from '../messages';
import defaultNavItems from '../navItems';

export type StaticEntry = {
  name: string;
  to: NonNullable<WrapperTo>;
  message: MessageDescriptor;
  section?: MessageDescriptor;
  featureNames?: TAppConfigurationSetting[];
  onlyCheckAllowed?: boolean;
};

// Pages one level below the sidebar items. Their labels reuse the tab and
// menu labels of each section, so they stay in sync with what users see.
const subPageEntries: StaticEntry[] = [
  {
    name: 'dashboard-users',
    to: '/admin/dashboard/users',
    message: dashboardMessages.tabUsers,
    section: sidebarMessages.dashboard,
  },
  {
    name: 'dashboard-visitors',
    to: '/admin/dashboard/visitors',
    message: dashboardMessages.tabVisitors,
    section: sidebarMessages.dashboard,
  },
  {
    name: 'dashboard-representation',
    to: '/admin/dashboard/representation',
    message: dashboardMessages.tabRepresentativeness,
    section: sidebarMessages.dashboard,
  },
  {
    name: 'dashboard-moderation',
    to: '/admin/dashboard/moderation',
    message: dashboardMessages.feed,
    section: sidebarMessages.dashboard,
    featureNames: ['moderation'],
  },
  {
    name: 'users-admins',
    to: '/admin/users/admins',
    message: usersMessages.admins,
    section: sidebarMessages.users,
  },
  {
    name: 'users-space-moderators',
    to: '/admin/users/space-moderators',
    message: usersMessages.spaceManagers,
    section: sidebarMessages.users,
    featureNames: ['spaces'],
  },
  {
    name: 'users-folder-moderators',
    to: '/admin/users/folder-moderators',
    message: usersMessages.folderManagers,
    section: sidebarMessages.users,
  },
  {
    name: 'users-project-moderators',
    to: '/admin/users/project-moderators',
    message: usersMessages.projectManagers,
    section: sidebarMessages.users,
  },
  {
    name: 'users-blocked',
    to: '/admin/users/blocked',
    message: usersMessages.blockedUsers,
    section: sidebarMessages.users,
    featureNames: ['user_blocking'],
  },
  {
    name: 'users-invitations',
    to: '/admin/users/invitations',
    message: invitationsMessages.tabInviteUsers,
    section: sidebarMessages.users,
  },
  {
    name: 'users-invitations-all',
    to: '/admin/users/invitations/all',
    message: invitationsMessages.tabAllInvitations,
    section: sidebarMessages.users,
  },
  {
    name: 'messaging-custom',
    to: '/admin/messaging/emails/custom',
    message: messagingMessages.customEmails,
    section: sidebarMessages.messaging,
  },
  {
    name: 'messaging-automated',
    to: '/admin/messaging/emails/automated',
    message: messagingMessages.tabAutomatedEmails,
    section: sidebarMessages.messaging,
  },
  {
    name: 'pages-menu-pages',
    to: '/admin/pages-menu/pages',
    message: pagesMenuTabsMessages.pagesTab,
    section: sidebarMessages.menu,
  },
  {
    name: 'pages-menu-menu',
    to: '/admin/pages-menu/menu',
    message: pagesMenuTabsMessages.menuTab,
    section: sidebarMessages.menu,
  },
  {
    name: 'settings-branding',
    to: '/admin/settings/branding',
    message: settingsMessages.tabBranding,
    section: sidebarMessages.settings,
  },
  {
    name: 'settings-registration',
    to: '/admin/settings/registration',
    message: settingsMessages.tabRegistration,
    section: sidebarMessages.settings,
  },
  {
    name: 'settings-topics',
    to: '/admin/settings/topics',
    message: settingsMessages.tabTopics,
    section: sidebarMessages.settings,
  },
  {
    name: 'settings-areas',
    to: '/admin/settings/areas',
    message: settingsMessages.tabAreas,
    section: sidebarMessages.settings,
  },
  {
    name: 'settings-statuses',
    to: '/admin/settings/statuses',
    message: settingsMessages.statuses,
    section: sidebarMessages.settings,
  },
  {
    name: 'settings-policies',
    to: '/admin/settings/policies',
    message: settingsMessages.tabPolicies,
    section: sidebarMessages.settings,
  },
];

const navItemEntries: StaticEntry[] = defaultNavItems.map((navItem) => ({
  name: navItem.name,
  to: navItem.link,
  message: sidebarMessages[navItem.message],
  featureNames: navItem.featureNames,
  onlyCheckAllowed: navItem.onlyCheckAllowed,
}));

const staticEntries = [...navItemEntries, ...subPageEntries];

export default staticEntries;
