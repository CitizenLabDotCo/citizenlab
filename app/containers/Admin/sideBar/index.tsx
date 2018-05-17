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
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

const Menu = styled.nav`
  background: ${ colors.adminMenuBackground };
  flex: 0 0 320px;
  margin-top: 0px;
  padding-top: 100px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  ${media.smallerThanMinTablet`
    flex: 0 0 70px;
  `}
`;

const IconWrapper = styled.div`
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
`;


const Text = styled.div`
  color: ${colors.adminLightText};
  font-size: 16px;
  font-weight: 400;
  line-height: 19px;
  margin-left: 10px;
  flex: 1;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const MenuItem: any = styled(Link)`
  width: 210px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  padding-left: 5px;
  padding-right: 15px;
  padding-bottom: 1px;
  margin: 0;
  cursor: pointer;
  margin-bottom: 5px;

  &:hover {
    ${Text} {
      color: #fff;
    };
    .cl-icon {
      .cl-icon-primary {
        fill: ${colors.clIconAccent}
      }
      .cl-icon-accent {
        fill: ${colors.clIconPrimary}
      }
    };
  }


  &.active {
    background: rgba(0, 0, 0, 0.2);

    ${Text} {
      color: #fff;
    };

    .cl-icon {
      .cl-icon-primary {
        fill: ${colors.clIconAccent}
      }
      .cl-icon-accent {
        fill: ${colors.clIconPrimary}
      }
    };
  }
`;

const Sul = styled.ul`
  list-style-type: none;
  margin: 0;
  padding: 0;
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
        iconName: 'stats',
        message: 'dashboard',
        isActive: (pathname) => (pathname === '/admin'),
      },
      {
        id: 'users',
        link: '/admin/users',
        iconName: 'users',
        message: 'users',
        isActive: (pathName) => (pathName.startsWith('/admin/users'))
      },
      {
        id: 'projects',
        link: '/admin/projects',
        iconName: 'folder',
        message: 'projects',
        isActive: (pathName) => (pathName.startsWith('/admin/projects'))
      },
      {
        id: 'ideas',
        link: '/admin/ideas',
        iconName: 'ideas',
        message: 'ideas',
        isActive: (pathName) => (pathName.startsWith('/admin/ideas'))
      },
      {
        id: 'settings',
        link: '/admin/settings/general',
        iconName: 'setting',
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
      <Menu role="navigation">
        <Sul>
          {navItems.map((route) => (
            <FeatureFlag name={route.featureName} key={route.id}>
              <li>
                <MenuItem className={route.isActive(pathname) && 'active'} to={route.link}>
                    <IconWrapper><Icon name={route.iconName} /></IconWrapper>
                    <Text>{formatMessage({ ...messages[route.message] })}</Text>
                  {route.isActive(pathname) && <Icon name="arrowLeft" />}
                </MenuItem>
              </li>
            </FeatureFlag>
          ))}
        </Sul>
      </Menu>
    );
  }
}

export default withRouter<Props>(injectIntl(Sidebar));
