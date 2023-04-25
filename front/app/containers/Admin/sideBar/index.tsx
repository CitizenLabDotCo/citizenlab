import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError, isPage } from 'utils/helperUtils';
import { get } from 'lodash-es';

// router
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

// components
import { Icon, IconNames, Box, Text } from '@citizenlab/cl2-component-library';
import MenuItem from './MenuItem';
import Link from 'utils/cl-router/Link';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors, fontSizes, stylingConsts } from 'utils/styleUtils';
import { lighten } from 'polished';
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
import { TAppConfigurationSetting } from 'api/app_configuration/types';

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

const IconWrapper = styled.div`
  flex: 0 0 auto;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CustomText = styled.div`
  flex: 1;
  color: ${colors.white};
  opacity: 0.7;

  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 19px;
  margin-left: 10px;

  ${media.phone`
    display: none;
  `}
`;

const Spacer = styled.div`
  flex-grow: 1;
`;

const MenuLink = styled.a`
  flex: 0 0 auto;
  width: 210px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 5px;
  padding-right: 15px;
  cursor: pointer;
  border-radius: ${(props) => props.theme.borderRadius};
  transition: all 100ms ease-out;

  &:hover,
  &.focus-visible {
    background: rgba(0, 0, 0, 0.36);

    ${CustomText} {
      opacity: 1;
    }
  }

  ${media.tablet`
    width: 56px;
    padding-right: 5px;

    ${CustomText} {
      display: none;
    }
  `}
`;

const GetStartedLink = styled(MenuLink)`
  padding-bottom: 1px;
  margin-bottom: 25px;
  background: ${lighten(0.05, colors.blue700)};

  &:hover {
    background: ${lighten(0.1, colors.blue700)};
  }
`;

interface InputProps {}
interface DataProps {
  authUser: GetAuthUserChildProps;
  ideasCount: GetIdeasCountChildProps;
  initiativesCount: GetInitiativesCountChildProps;
}
interface Props extends InputProps, DataProps {}

interface State {
  navItems: NavItem[];
}

export type NavItem = {
  name: string;
  link: string;
  iconName: IconNames;
  message: keyof typeof messages;
  featureNames?: TAppConfigurationSetting[];
  count?: number;
  onlyCheckAllowed?: boolean;
};

class Sidebar extends PureComponent<
  Props & WrappedComponentProps & WithRouterProps,
  State
> {
  constructor(props: Props & WrappedComponentProps & WithRouterProps) {
    super(props);

    this.state = {
      navItems: [
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
          name: 'reporting',
          link: `/admin/reporting`,
          iconName: 'sidebar-reporting',
          message: 'reporting',
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
          featureNames: [
            'manual_emailing',
            'automated_emailing_control',
            'texting',
          ],
        },
        {
          name: 'menu',
          link: '/admin/pages-menu',
          iconName: 'sidebar-pages-menu',
          message: 'menu',
        },
        {
          name: 'settings',
          link: '/admin/settings/general',
          iconName: 'sidebar-settings',
          message: 'settings',
        },
      ],
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { ideasCount, initiativesCount } = nextProps;
    if (
      !isNilOrError(ideasCount.count) &&
      ideasCount.count !==
        prevState.navItems.find((navItem) => navItem.name === 'ideas').count
    ) {
      const { navItems } = prevState;
      const nextNavItems = navItems;
      const ideasIndex = navItems.findIndex(
        (navItem) => navItem.name === 'ideas'
      );
      nextNavItems[ideasIndex].count = ideasCount.count;
      return { navItems: nextNavItems };
    }
    if (
      !isNilOrError(initiativesCount.count) &&
      initiativesCount.count !==
        prevState.navItems.find((navItem) => navItem.name === 'initiatives')
          .count
    ) {
      const { navItems } = prevState;
      const nextNavItems = navItems;
      const initiativesIndex = navItems.findIndex(
        (navItem) => navItem.name === 'initiatives'
      );
      nextNavItems[initiativesIndex].count = initiativesCount.count;
      return { navItems: nextNavItems };
    }
    return prevState;
  }

  handleData = (insertNavItemOptions: InsertConfigurationOptions<NavItem>) => {
    this.setState(({ navItems }) => ({
      navItems: insertConfiguration(insertNavItemOptions)(navItems),
    }));
  };

  render() {
    const { formatMessage } = this.props.intl;
    const { navItems } = this.state;
    const isPagesAndMenuPage = isPage('pages_menu', location.pathname);

    if (!(navItems && navItems.length > 1)) {
      return null;
    }

    return (
      <Menu>
        <Outlet
          id="app.containers.Admin.sideBar.navItems"
          onData={this.handleData}
        />
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
                <IconWrapper>
                  <Icon name="arrow-left-circle" fill={colors.white} />
                </IconWrapper>
                <Text color="white" fontSize="s" ml="10px">
                  {formatMessage({ ...messages.toPlatform })}
                </Text>
              </Box>
            </Link>
          </Box>

          {navItems.map((navItem) => (
            <MenuItem navItem={navItem} key={navItem.name} />
          ))}
          <Spacer />

          <MenuLink
            href={formatMessage(messages.linkToAcademy)}
            target="_blank"
          >
            <IconWrapper>
              <Icon name="sidebar-academy" />
            </IconWrapper>
            <CustomText>{formatMessage({ ...messages.academy })}</CustomText>
          </MenuLink>

          <GetStartedLink
            href={formatMessage(messages.linkToGuide)}
            target="_blank"
          >
            <IconWrapper>
              <Icon name="sidebar-guide" />
            </IconWrapper>
            <CustomText>{formatMessage({ ...messages.guide })}</CustomText>
          </GetStartedLink>
        </MenuInner>
      </Menu>
    );
  }
}

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

const SideBarWithHocs = withRouter(injectIntl(Sidebar));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <SideBarWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
