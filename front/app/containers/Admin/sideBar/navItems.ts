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
    link: '/admin/dashboard/overview',
    iconName: 'dashboard',
    message: 'dashboard',
  },
  {
    name: 'projects',
    link: '/admin/projects',
    iconName: 'projects',
    message: 'projects',
  },
  {
    name: 'ideas',
    link: '/admin/ideas',
    iconName: 'messages-inbox',
    message: 'inputManager',
  },
  {
    name: 'initiatives',
    link: '/admin/initiatives',
    iconName: 'proposals',
    message: 'initiatives',
    featureNames: ['initiatives'],
    onlyCheckAllowed: true,
  },
  {
    name: 'userinserts',
    link: '/admin/users',
    iconName: 'users',
    message: 'users',
  },
  {
    name: 'messaging',
    link: '/admin/messaging',
    iconName: 'messages',
    message: 'messaging',
    featureNames: ['manual_emailing', 'automated_emailing_control', 'texting'],
  },
  {
    name: 'reporting',
    link: `/admin/reporting`,
    iconName: 'reports',
    message: 'reporting',
  },
  {
    name: 'tools',
    link: `/admin/tools`,
    iconName: 'grid',
    message: 'tools',
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

export default navItems;
