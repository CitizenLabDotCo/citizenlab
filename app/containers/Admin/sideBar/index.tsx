import React from 'react';
import { Observable, Subscription } from 'rxjs/Rx';

// router
import { Link, withRouter, WithRouterProps } from 'react-router';

// components
import Icon, { IconNames } from 'components/UI/Icon';
import FeatureFlag from 'components/FeatureFlag';
import { hasPermission } from 'services/permissions';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled, { css } from 'styled-components';
import { media, colors } from 'utils/styleUtils';

const Menu = styled.div`
  background: ${ colors.adminMenuBackground };
  flex: 0 0 240px;
  margin-top: 0px;
  padding-top: 45px;
  z-index: 1;

  ${media.smallerThanMinTablet`
    flex: 0 0 70px;
  `}
`;

const IconWrapper = styled.div`
  width: 49px;
  height: 49px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledIcon = styled(Icon)`
  height: 18px;
  max-width: 30px;
  fill: #fff;
  opacity: 0.5;

  &.idea {
    height: 21px;
  }
`;

const Text = styled.div`
  color: #fff;
  font-size: 17px;
  font-weight: 400;
  line-height: 21px;
  margin-left: 15px;
  opacity: 0.4;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const MenuLink = styled(Link)`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  padding-left: 12px;
`;

const MenuItem: any = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  padding: 0;
  padding-bottom: 1px;
  margin: 0;
  margin-bottom: 5px;
  cursor: pointer;

  &:hover {
    ${StyledIcon} {
      opacity: 1;
    };

    ${Text} {
      opacity: 1;
    };
  }

  ${(props: any) => props.active && css`
    background: #222;

    ${StyledIcon} {
      opacity: 1;
    };

    ${Text} {
      opacity: 1;
    };
  `}
`;

type Props = {};

type State = {
  navItems: NavItem[];
};

type NavItem = {
  id: string,
  link: string,
  iconName: IconNames,
  message: keyof typeof messages,
  featureName?: string,
  isActive: (pathname: string) => boolean,
};

class Sidebar extends React.PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  routes: NavItem[];
  subscriptions: Subscription[];

  constructor(props: Props & InjectedIntlProps & WithRouterProps) {
    super(props);
    this.state = {
      navItems: [],
    };
    this.routes = [
      {
        id: 'dashboard',
        link: '/admin',
        iconName: 'analytics',
        message: 'dashboard',
        isActive: (pathname) => (pathname === '/admin'),
      },
      {
        id: 'users',
        link: '/admin/users/registered',
        iconName: 'people',
        message: 'users',
        isActive: (pathName) => (pathName.startsWith('/admin/users'))
      },
      {
        id: 'groups',
        link: '/admin/groups',
        iconName: 'groups',
        message: 'groups',
        featureName: 'groups',
        isActive: (pathName) => (pathName.startsWith('/admin/groups'))
      },
      {
        id: 'projects',
        link: '/admin/projects',
        iconName: 'project',
        message: 'projects',
        isActive: (pathName) => (pathName.startsWith('/admin/projects'))
      },
      {
        id: 'settings',
        link: '/admin/settings/general',
        iconName: 'settings',
        message: 'settings',
        isActive: (pathName) => (pathName.startsWith('/admin/settings'))
      },
    ];
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      Observable.combineLatest(
        this.routes.map((route) => hasPermission({
          item: { type: 'route', path: route.link },
          action: 'access'
        }))
      ).subscribe((permissions) => {
        this.setState({
          navItems: permissions.filter(permission => permission).map((_permission, index) => {
            return this.routes[index];
          })
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { pathname } = this.props.location;
    const { navItems } = this.state;

    if (navItems.length <= 1) {
      return null;
    }

    return (
      <Menu>
        {navItems.map((route) => (
          <FeatureFlag name={route.featureName} key={route.id}>
            <MenuItem active={route.isActive(pathname)}>
              <MenuLink to={route.link}>
                <IconWrapper><StyledIcon name={route.iconName} /></IconWrapper>
                <Text>{formatMessage({ ...messages[route.message] })}</Text>
              </MenuLink>
            </MenuItem>
          </FeatureFlag>
        ))}
      </Menu>
    );
  }
}

export default withRouter<Props>(injectIntl(Sidebar));
