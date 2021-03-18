import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

// router
import { withRouter, WithRouterProps } from 'react-router';
import Link from 'utils/cl-router/Link';
import { getUrlLocale } from 'services/locale';

// components
import { Icon, IconNames } from 'cl2-component-library';
import FeatureFlag from 'components/FeatureFlag';
import MenuItem from './MenuItem';
import HasPermission from 'components/HasPermission';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, colors, fontSizes, stylingConsts } from 'utils/styleUtils';
import { lighten } from 'polished';

// resources
import GetFeatureFlag from 'resources/GetFeatureFlag';
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

const Menu = styled.div`
  z-index: 10;
  flex: 0 0 auto;
  width: 210px;

  @media print {
    display: none;
  }

  ${media.smallerThan1200px`
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
  padding-top: ${stylingConsts.menuHeight + 10}px;
  background: ${colors.adminMenuBackground};

  ${media.smallerThan1200px`
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

const Text = styled.div`
  flex: 1;
  color: ${colors.adminLightText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 19px;
  margin-left: 10px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const Spacer = styled.div`
  flex-grow: 1;
`;

const GetStartedLink = styled(Link)`
  flex: 0 0 auto;
  width: 210px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 5px;
  padding-right: 15px;
  padding-bottom: 1px;
  margin-bottom: 25px;
  cursor: pointer;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${lighten(0.05, colors.adminMenuBackground)};
  transition: all 100ms ease-out;

  &:hover {
    background: ${lighten(0.1, colors.adminMenuBackground)};

    ${Text} {
      color: #fff;
    }
  }

  ${media.smallerThan1200px`
    width: 56px;
    padding-right: 5px;

    ${Text} {
      display: none;
    }
  `}
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
  message: string;
  featureName?: string;
  isActive: (pathname: string) => boolean;
  count?: number;
  onlyCheckAllowed?: boolean;
};

type Tracks = {
  trackFakeDoor: Function;
};

class Sidebar extends PureComponent<
  Props & InjectedIntlProps & WithRouterProps & Tracks,
  State
> {
  constructor(props: Props & InjectedIntlProps & WithRouterProps & Tracks) {
    super(props);

    this.state = {
      navItems: [
        {
          name: 'insights',
          link: '/admin/dashboard',
          iconName: 'stats',
          message: 'dashboard',
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/dashboard`
            ),
        },
        {
          name: 'projects',
          link: '/admin/projects',
          iconName: 'folder',
          message: 'projects',
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/projects`
            ),
        },
        {
          name: 'processing',
          link: '/admin/processing',
          iconName: 'processing',
          featureName: 'manual_tagging',
          message: 'processing',
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/processing`
            ),
        },
        {
          name: 'workshops',
          link: '/admin/workshops',
          iconName: 'workshops',
          message: 'workshops',
          featureName: 'workshops',
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/workshops`
            ),
        },
        {
          name: 'ideas',
          link: '/admin/ideas',
          iconName: 'idea2',
          message: 'inputManager',
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/ideas`
            ),
        },
        {
          name: 'initiatives',
          link: '/admin/initiatives',
          iconName: 'initiativesAdminMenuIcon',
          message: 'initiatives',
          featureName: 'initiatives',
          onlyCheckAllowed: true,
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/initiatives`
            ),
        },
        {
          name: 'userinserts',
          link: '/admin/users',
          iconName: 'users',
          message: 'users',
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/users`
            ),
        },
        {
          name: 'invitations',
          link: '/admin/invitations',
          iconName: 'invitations',
          message: 'invitations',
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/invitations`
            ),
        },
        {
          name: 'emails',
          link: '/admin/emails',
          iconName: 'emails',
          message: 'emails',
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/emails`
            ),
        },
        {
          name: 'settings',
          link: '/admin/settings/general',
          iconName: 'setting',
          message: 'settings',
          isActive: (pathName) =>
            pathName.startsWith(
              `${
                getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''
              }/admin/settings`
            ),
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
          {navItems.map((navItem) => {
            if (navItem.name === 'emails') {
              return (
                <GetFeatureFlag name="manual_emailing" key={navItem.name}>
                  {(manualEmailing) => (
                    <GetFeatureFlag name="automated_emailing_control">
                      {(automatedEmailing) =>
                        manualEmailing || automatedEmailing ? (
                          <MenuItem route={navItem} key={navItem.name} />
                        ) : null
                      }
                    </GetFeatureFlag>
                  )}
                </GetFeatureFlag>
              );
            } else if (navItem.featureName) {
              return (
                <FeatureFlag
                  name={navItem.featureName}
                  onlyCheckAllowed={navItem.onlyCheckAllowed}
                  key={navItem.name}
                >
                  <MenuItem route={navItem} key={navItem.name} />
                </FeatureFlag>
              );
            } else {
              return <MenuItem route={navItem} key={navItem.name} />;
            }
          })}
          <Spacer />
          <HasPermission
            item={{ type: 'route', path: '/admin/guide' }}
            action="access"
          >
            <GetStartedLink to="/admin/guide">
              <IconWrapper>
                <Icon name="circleInfo" />
              </IconWrapper>
              <Text>{formatMessage({ ...messages.guide })}</Text>
            </GetStartedLink>
          </HasPermission>
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

const SideBarWithHocs = withRouter<Props>(injectIntl(Sidebar));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <SideBarWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
