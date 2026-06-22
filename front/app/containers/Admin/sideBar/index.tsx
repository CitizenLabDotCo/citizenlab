import React, { useState, useEffect } from 'react';

import {
  Icon,
  Box,
  Text,
  useBreakpoint,
  media,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { InsertConfigurationOptions } from 'typings';

import { IAppConfiguration } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import useAuthUser from 'api/me/useAuthUser';
import { IUser } from 'api/users/types';

import useParallelParticipation from 'hooks/useParallelParticipation';

import Outlet from 'components/Outlet';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isPage } from 'utils/helperUtils';
import { insertConfiguration } from 'utils/moduleUtils';
import { isAdmin } from 'utils/permissions/roles';
import { useLocation } from 'utils/router';

import MenuItem from './MenuItem';
import messages from './messages';
import defaultNavItems, { NavItem } from './navItems';
import NotificationsPopup from './NotificationsPopup';
import SidebarCollapsedContext from './SidebarCollapsedContext';
import { SupportMenu } from './SupportMenu';
import { UserMenu } from './UserMenu';

const Menu = styled.div<{ $collapsed?: boolean }>`
  z-index: 10;
  flex: 0 0 auto;
  width: ${({ $collapsed }) => ($collapsed ? '80px' : '224px')};

  @media print {
    display: none;
  }

  ${media.tablet`
    width: 80px;
  `}
`;

const MenuInner = styled.nav`
  flex: 0 0 auto;
  width: 224px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 0;
  bottom: 0;
  padding-bottom: 35px;
  background: #003349;

  &.collapsed {
    width: 80px;
  }

  ${media.tablet`
    width: 80px;
  `}
`;

const getTopAndBottomNavItems = (navItems: NavItem[]) => {
  // Using this to avoid looping twice
  const [topNavItems, bottomNavItems] = navItems.reduce(
    (accumulator, navItem) => {
      const [top, bottom] = accumulator;
      if (navItem.showAtBottom) {
        return [top, [...bottom, navItem]];
      } else {
        return [[...top, navItem], bottom];
      }
    },
    [[], []]
  );
  return [topNavItems, bottomNavItems];
};

interface Props {
  authUser: IUser;
  appConfiguration: IAppConfiguration;
}

const Sidebar = ({ authUser }: Props) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();

  const { data: ideasCount } = useIdeasFilterCounts(
    {
      feedback_needed: true,
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      assignee: authUser?.data.id,
      transitive: true,
    },
    isAdmin(authUser)
  );

  const [navItems, setNavItems] = useState(defaultNavItems);
  const isPagesAndMenuPage = isPage('pages_menu', pathname);
  const isSmallerThanPhone = useBreakpoint('tablet');
  const parallelParticipation = useParallelParticipation();
  // `folders` and `new` share the `/admin/projects/:x` shape but aren't a
  // single project, so exclude them.
  const projectSlug = pathname.match(/\/admin\/projects\/([^/]+)/)?.[1];
  const onProjectPage =
    parallelParticipation &&
    !!projectSlug &&
    projectSlug !== 'new' &&
    projectSlug !== 'folders';

  // `forceCollapsed` ignores viewport; subcomponents OR it with their own
  // tablet breakpoint. `collapsed` is the effective state.
  const forceCollapsed = onProjectPage;
  const collapsed = isSmallerThanPhone || forceCollapsed;

  useEffect(() => {
    setNavItems((prevNavItems) => {
      const updatedNavItems: NavItem[] = prevNavItems.map(
        (navItem: NavItem) => {
          if (
            navItem.name === 'ideas' &&
            ideasCount &&
            ideasCount.data.attributes.total
          ) {
            return { ...navItem, count: ideasCount.data.attributes.total };
          }
          return navItem;
        }
      );
      return updatedNavItems;
    });
  }, [ideasCount]);

  const handleData = (
    insertNavItemOptions: InsertConfigurationOptions<NavItem>
  ) => {
    setNavItems(insertConfiguration(insertNavItemOptions)(navItems));
  };

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!(navItems && navItems.length > 1)) {
    return null;
  }
  const [topNavItems, bottomNavItems] = getTopAndBottomNavItems(navItems);

  return (
    <SidebarCollapsedContext.Provider value={forceCollapsed}>
      <Menu $collapsed={collapsed}>
        <Outlet
          id="app.containers.Admin.sideBar.navItems"
          onData={handleData}
        />
        <MenuInner
          id="sidebar"
          className={`intercom-admin-general-navigation-side-bar${
            collapsed ? ' collapsed' : ''
          }`}
        >
          <Box w="100%">
            {/* The aria-label here is used when there is no clear
             * 'text-like' element as a child of the Link component,
             * making it unclear for screen readers what the link point to.
             * https://stackoverflow.com/a/53765144/7237112
             */}
            <Link to="/" aria-label={formatMessage(messages.toPlatform)}>
              <Box
                height={
                  isPagesAndMenuPage ? `${stylingConsts.menuHeight}px` : '60px'
                }
                background={colors.teal500}
                mb="10px"
                display="flex"
                alignItems="center"
                pr={collapsed ? '0px' : '8px'}
                pl={collapsed ? '0px' : '16px'}
                py="10px"
                justifyContent={collapsed ? 'center' : undefined}
              >
                <Box
                  display="flex"
                  flex="0 0 auto"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon
                    name="arrow-left-circle"
                    fill={colors.white}
                    width="20px"
                    height="20px"
                  />
                </Box>
                {!collapsed && (
                  <Text color="white" fontSize="s" ml="17.5px">
                    {formatMessage({ ...messages.toPlatform })}
                  </Text>
                )}
              </Box>
            </Link>
          </Box>

          {topNavItems.map((navItem) => (
            <MenuItem navItem={navItem} key={navItem.name} />
          ))}

          <Box display="flex" flexGrow={1} />

          {bottomNavItems.map((navItem) => (
            <MenuItem navItem={navItem} key={navItem.name} />
          ))}

          <NotificationsPopup />
          <UserMenu />
          <SupportMenu />
        </MenuInner>
      </Menu>
    </SidebarCollapsedContext.Provider>
  );
};

const SidebarWrapper = () => {
  const { data: authUser } = useAuthUser();
  const { data: appConfiguration } = useAppConfiguration();

  if (!authUser || !appConfiguration) {
    return null;
  }

  return <Sidebar authUser={authUser} appConfiguration={appConfiguration} />;
};

export default SidebarWrapper;
