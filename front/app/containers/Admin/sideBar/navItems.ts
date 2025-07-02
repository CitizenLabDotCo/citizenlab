import { IconNames } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import { TAppConfigurationSetting } from 'api/app_configuration/types';

import messages from './messages';

export type NavItem = {
  name: string;
  link: RouteType;
  iconName: IconNames;
  message: keyof typeof messages;
  featureNames?: TAppConfigurationSetting[];
  count?: number;
  onlyCheckAllowed?: boolean;
  showAtBottom: boolean;
};

const defaultNavItems: NavItem[] = [
  /* Top items */
  {
    name: 'dashboard',
    link: '/admin/dashboard/overview',
    iconName: 'dashboard',
    message: 'dashboard',
    showAtBottom: false,
  },
  {
    name: 'projects',
    link: '/admin/projects',
    iconName: 'projects',
    message: 'projects',
    showAtBottom: false,
  },
  {
    name: 'ideas',
    link: '/admin/ideas',
    iconName: 'messages-inbox',
    message: 'inputManager',
    showAtBottom: false,
  },
  {
    name: 'userinserts',
    link: '/admin/users',
    iconName: 'users',
    message: 'users',
    showAtBottom: false,
  },
  {
    name: 'messaging',
    link: '/admin/messaging',
    iconName: 'messages',
    message: 'messaging',
    showAtBottom: false,
  },
  {
    name: 'reporting',
    link: `/admin/reporting/report-builder`,
    iconName: 'reports',
    message: 'reporting',
    featureNames: ['report_builder'],
    showAtBottom: false,
  },
  {
    name: 'community_monitor',
    link: '/admin/community-monitor',
    iconName: 'community_monitor',
    message: 'community_monitor',
    showAtBottom: false,
  },
  {
    name: 'inspirationHub',
    link: '/admin/inspiration-hub',
    iconName: 'globe',
    message: 'inspirationHub',
    showAtBottom: false,
  },
  /* Bottom items */
  {
    name: 'tools',
    link: `/admin/tools`,
    iconName: 'grid',
    message: 'tools',
    showAtBottom: true,
  },
  {
    name: 'menu',
    link: '/admin/pages-menu',
    iconName: 'organigram',
    message: 'menu',
    showAtBottom: true,
  },
  {
    name: 'settings',
    link: '/admin/settings/general',
    iconName: 'cog',
    message: 'settings',
    showAtBottom: true,
  },
];

export default defaultNavItems;
