import React, { useState, useEffect } from 'react';
import { isPage } from 'utils/helperUtils';

// components
import {
  Icon,
  Box,
  Text,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import MenuItem from './MenuItem';
import Link from 'utils/cl-router/Link';
import { SupportMenu } from './SupportMenu';
import { UserMenu } from './UserMenu';
import NotificationsPopup from './NotificationsPopup';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors, stylingConsts } from 'utils/styleUtils';

// resources
import Outlet from 'components/Outlet';
import { InsertConfigurationOptions } from 'typings';
import { insertConfiguration } from 'utils/moduleUtils';

import defaultNavItems, { NavItem } from './navItems';

// Hooks
import { useLocation } from 'react-router-dom';
import useAuthUser from 'api/me/useAuthUser';
import useIdeasCount from 'api/idea_count/useIdeasCount';
import useInitiativesCount from 'api/initiative_counts/useInitiativesCount';

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

const Sidebar = () => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const { data: authUser } = useAuthUser();
  const { data: ideasCount } = useIdeasCount({
    feedback_needed: true,
    assignee: authUser?.data.id,
  });
  const { data: initiativesCount } = useInitiativesCount({
    feedback_needed: true,
    assignee: authUser?.data.id,
  });
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
          } else if (
            navItem.name === 'initiatives' &&
            initiativesCount &&
            initiativesCount.data.attributes.count
          ) {
            return {
              ...navItem,
              count: initiativesCount.data.attributes.count,
            };
          }
          return navItem;
        }
      );
      return updatedNavItems;
    });
  }, [ideasCount, initiativesCount]);

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
          <Link to="/">
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

export default Sidebar;
