import React from 'react';
import { Subscription } from 'rxjs';
import { combineLatest } from 'rxjs/observable/combineLatest';

// router
import { withRouter, WithRouterProps } from 'react-router';
import Link from 'utils/cl-router/Link';
import { getUrlLocale } from 'services/locale';

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
  flex: 0 0 260px;
  background: ${ colors.adminMenuBackground };
  z-index: 1;
  display: flex;
  align-items: stretch;

  ${media.smallerThanMinTablet`
    flex: 0 0 70px;
  `}
`;

const MenuInner = styled.div`
  width: 100%;
  position: sticky;
  top: 119px;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  align-items: stretch;
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
  border-radius: 5px;
  display: flex;
  align-items: center;
  padding-left: 5px;
  padding-right: 15px;
  padding-bottom: 1px;
  margin-bottom: 5px;
  margin-left: 25px;
  margin-right: 25px;
  cursor: pointer;

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

  &.selected {
    background: rgba(0, 0, 0, 0.25);

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
        isActive: (pathName) => (pathName === `${getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''}/admin`),
      },
      {
        id: 'users',
        link: '/admin/users',
        iconName: 'users',
        message: 'users',
        isActive: (pathName) => (pathName.startsWith(`${getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''}/admin/users`))
      },
      {
        id: 'invitations',
        link: '/admin/invitations',
        iconName: 'invitations',
        message: 'invitations',
        isActive: (pathName) => (pathName.startsWith(`${getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''}/admin/invitations`))
      },
      {
        id: 'projects',
        link: '/admin/projects',
        iconName: 'folder',
        message: 'projects',
        isActive: (pathName) => (pathName.startsWith(`${getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''}/admin/projects`))
      },
      {
        id: 'ideas',
        link: '/admin/ideas',
        iconName: 'ideas',
        message: 'ideas',
        isActive: (pathName) => (pathName.startsWith(`${getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''}/admin/ideas`))
      },
      {
        id: 'settings',
        link: '/admin/settings/general',
        iconName: 'setting',
        message: 'settings',
        isActive: (pathName) => (pathName.startsWith(`${getUrlLocale(pathName) ? `/${getUrlLocale(pathName)}` : ''}/admin/settings`))
      },
    ];
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      combineLatest(
        this.routes.map((route) => hasPermission({
          item: { type: 'route', path: route.link },
          action: 'access'
        }))
      ).subscribe((permissions) => {
        this.setState({
          navItems: this.routes.filter((_, index) => permissions[index])
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

    if (!(navItems && navItems.length > 1)) {
      return null;
    }

    return (
      <Menu role="navigation">
        <MenuInner>
          {navItems.map((route) => (
            <FeatureFlag name={route.featureName} key={route.id}>
              <MenuItem activeClassName="active" className={`${route.isActive(pathname) ? 'selected' : ''}`} to={route.link}>
                <IconWrapper><Icon name={route.iconName} /></IconWrapper>
                <Text>{formatMessage({ ...messages[route.message] })}</Text>
                {route.isActive(pathname) && <Icon name="arrowLeft" />}
              </MenuItem>
            </FeatureFlag>
          ))}
        </MenuInner>
      </Menu>
    );
  }
}

export default withRouter<Props>(injectIntl(Sidebar));
