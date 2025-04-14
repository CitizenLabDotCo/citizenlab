import { IconNames } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import {
  IAppConfiguration,
  TAppConfigurationSetting,
} from 'api/app_configuration/types';
import { coreSettings } from 'api/app_configuration/utils';

import messages from './messages';

export type NavItem = {
  name: string;
  link: RouteType;
  iconName: IconNames;
  message: keyof typeof messages;
  featureNames?: TAppConfigurationSetting[];
  count?: number;
  onlyCheckAllowed?: boolean;
  showAtBottom?: boolean;
};

const getInspirationHubLink = (country_code: string | null) => {
  if (!country_code) {
    return '/admin/inspiration-hub';
  }

  const pinnedProjectsCountryFilter = `q[pin_country_code_eq]=${country_code}`;
  const allProjectsCountryFilter = `q[tenant_country_code_in]=${JSON.stringify([
    country_code,
  ])}`;

  return `/admin/inspiration-hub?${pinnedProjectsCountryFilter}&${allProjectsCountryFilter}` as RouteType;
};

const getDefaultNavItems = ({ data }: IAppConfiguration): NavItem[] => {
  const country_code = coreSettings(data).country_code;

  return [
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
    },
    {
      name: 'reporting',
      link: `/admin/reporting/report-builder`,
      iconName: 'reports',
      message: 'reporting',
      featureNames: ['report_builder'],
    },
    {
      name: 'community_monitor',
      link: '/admin/community-monitor',
      iconName: 'community_monitor',
      message: 'community_monitor',
      featureNames: ['community_monitor'],
    },
    {
      name: 'inspirationHub',
      link: getInspirationHubLink(country_code),
      iconName: 'globe',
      message: 'inspirationHub',
      featureNames: ['project_library'],
    },
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
};

export default getDefaultNavItems;
