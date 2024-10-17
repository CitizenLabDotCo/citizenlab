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
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { InsertConfigurationOptions } from 'typings';

import useIdeasCount from 'api/idea_count/useIdeasCount';
import useAuthUser from 'api/me/useAuthUser';
import { IUser } from 'api/users/types';

import Outlet from 'components/Outlet';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isPage } from 'utils/helperUtils';
import { insertConfiguration } from 'utils/moduleUtils';
import { isAdmin } from 'utils/permissions/roles';

import MenuItem from './MenuItem';
import messages from './messages';
import defaultNavItems, { NavItem } from './navItems';
import NotificationsPopup from './NotificationsPopup';
import { SupportMenu } from './SupportMenu';
import { UserMenu } from './UserMenu';

const Menu = styled.div`
  z-index: 10;
  flex: 0 0 auto;
  width: 210px;

  @media print {
    display: none;
  }

  ${media.tablet`
    width: 80px;
  `}
`;

const MenuInner = styled.nav`
  flex: 0 0 auto;
  width: 210px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: fixed;
  top: 0;
  bottom: 0;
  padding-bottom: 35px;
  background: #003349;

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
}

const Sidebar = ({ authUser }: Props) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { data: ideasCount } = useIdeasCount(
    {
      feedback_needed: true,
      assignee: authUser?.data.id,
      transitive: true,
    },
    isAdmin(authUser)
  );

  const [navItems, setNavItems] = useState<NavItem[]>(defaultNavItems);
  const isPagesAndMenuPage = isPage('pages_menu', pathname);
  const isSmallerThanPhone = useBreakpoint('tablet');

  useEffect(() => {
    setNavItems((prevNavItems) => {
      const updatedNavItems: NavItem[] = prevNavItems.map(
        (navItem: NavItem) => {
          if (
            navItem.name === 'ideas' &&
            ideasCount &&
            ideasCount.data.attributes.count
          ) {
            return { ...navItem, count: ideasCount.data.attributes.count };
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

  if (!(navItems && navItems.length > 1)) {
    return null;
  }
  const [topNavItems, bottomNavItems] = getTopAndBottomNavItems(navItems);

  return (
    <Menu>
      <Outlet id="app.containers.Admin.sideBar.navItems" onData={handleData} />
      <MenuInner id="sidebar">
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
              pr={isSmallerThanPhone ? '0px' : '8px'}
              pl={isSmallerThanPhone ? '0px' : '16px'}
              py="10px"
              justifyContent={isSmallerThanPhone ? 'center' : undefined}
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
              {!isSmallerThanPhone && (
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
  );
};

const SidebarWrapper = () => {
  const { data: authUser } = useAuthUser();
  if (!authUser) return null;

  return <Sidebar authUser={authUser} />;
};

export default SidebarWrapper;
