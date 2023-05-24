import React, { useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError, isPage } from 'utils/helperUtils';
import { get } from 'lodash-es';

// components
import { Icon, Box, Text } from '@citizenlab/cl2-component-library';
import MenuItem from './MenuItem';
import Link from 'utils/cl-router/Link';
import { SupportMenu } from './SupportMenu';
import { UserMenu } from './UserMenu';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors, stylingConsts } from 'utils/styleUtils';
import { darkSkyBlue } from 'components/admin/NavigationTabs/Tab';

// resources
import GetIdeasCount, {
  GetIdeasCountChildProps,
} from 'resources/GetIdeasCount';
import GetInitiativesCount, {
  GetInitiativesCountChildProps,
} from 'resources/GetInitiativesCount';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import Outlet from 'components/Outlet';
import { InsertConfigurationOptions } from 'typings';
import { insertConfiguration } from 'utils/moduleUtils';

import defaultNavItems, { NavItem } from './navItems';

// Hooks
import { useLocation } from 'react-router-dom';

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
  background: ${colors.blue700};

  ${media.tablet`
    width: 80px;
  `}
`;

interface InputProps {}
interface DataProps {
  authUser: GetAuthUserChildProps;
  ideasCount: GetIdeasCountChildProps;
  initiativesCount: GetInitiativesCountChildProps;
}
interface Props extends InputProps, DataProps {}

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

const Sidebar = ({ ideasCount, initiativesCount }: Props) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const [navItems, setNavItems] = useState<NavItem[]>(defaultNavItems);
  const isPagesAndMenuPage = isPage('pages_menu', pathname);

  useEffect(() => {
    setNavItems((prevNavItems) => {
      const updatedNavItems: NavItem[] = prevNavItems.map(
        (navItem: NavItem) => {
          if (
            navItem.name === 'ideas' &&
            !isNilOrError(ideasCount.count) &&
            ideasCount.count
          ) {
            return { ...navItem, count: ideasCount.count };
          } else if (
            navItem.name === 'initiatives' &&
            !isNilOrError(initiativesCount.count) &&
            initiativesCount.count
          ) {
            return { ...navItem, count: initiativesCount.count };
          }
          return navItem;
        }
      );
      return updatedNavItems;
    });
  }, [ideasCount.count, initiativesCount.count]);

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
              background={darkSkyBlue}
              mb="10px"
              display="flex"
              alignItems="center"
              pl="5px"
            >
              <Box
                display="flex"
                flex="0 0 auto"
                w="45px"
                h="45px"
                alignItems="center"
                justifyContent="center"
              >
                <Icon name="arrow-left-circle" fill={colors.white} />
              </Box>
              <Text color="white" fontSize="s" ml="10px">
                {formatMessage({ ...messages.toPlatform })}
              </Text>
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

        <SupportMenu />
        <UserMenu />
      </MenuInner>
    </Menu>
  );
};

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  ideasCount: ({ authUser, render }) => (
    <GetIdeasCount feedbackNeeded={true} assignee={get(authUser, 'id')}>
      {render}
    </GetIdeasCount>
  ),
  initiativesCount: ({ authUser, render }) => (
    <GetInitiativesCount feedbackNeeded={true} assignee={get(authUser, 'id')}>
      {render}
    </GetInitiativesCount>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <Sidebar {...inputProps} {...dataProps} />}
  </Data>
);
