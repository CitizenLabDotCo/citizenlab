import { TAppConfigurationSetting } from 'api/app_configuration/types';
import { IconNames } from '@citizenlab/cl2-component-library';
import messages from './messages';

export type NavItem = {
  name: string;
  link: string;
  iconName: IconNames;
  message: keyof typeof messages;
  featureNames?: TAppConfigurationSetting[];
  count?: number;
  onlyCheckAllowed?: boolean;
  showAtBottom?: boolean;
};

const navItems: NavItem[] = [
  {
    name: 'dashboard',
    link: '/admin/dashboard',
    iconName: 'sidebar-dashboards',
    message: 'dashboard',
  },
  {
    name: 'projects',
    link: '/admin/projects',
    iconName: 'sidebar-folder',
    message: 'projects',
  },
  {
    name: 'workshops',
    link: '/admin/workshops',
    iconName: 'sidebar-workshops',
    message: 'workshops',
    featureNames: ['workshops'],
  },
  {
    name: 'ideas',
    link: '/admin/ideas',
    iconName: 'sidebar-input-manager',
    message: 'inputManager',
  },
  {
    name: 'initiatives',
    link: '/admin/initiatives',
    iconName: 'sidebar-proposals',
    message: 'initiatives',
    featureNames: ['initiatives'],
    onlyCheckAllowed: true,
  },
  {
    name: 'userinserts',
    link: '/admin/users',
    iconName: 'sidebar-users',
    message: 'users',
  },
  {
    name: 'messaging',
    link: '/admin/messaging',
    iconName: 'sidebar-messaging',
    message: 'messaging',
    featureNames: ['manual_emailing', 'automated_emailing_control', 'texting'],
  },
  {
    name: 'reporting',
    link: `/admin/reporting`,
    iconName: 'sidebar-reporting',
    message: 'reporting',
  },
  {
    name: 'menu',
    link: '/admin/pages-menu',
    iconName: 'sidebar-pages-menu',
    message: 'menu',
    showAtBottom: true,
  },
  {
    name: 'settings',
    link: '/admin/settings/general',
    iconName: 'sidebar-settings',
    message: 'settings',
    showAtBottom: true,
  },
];

export default navItems;
