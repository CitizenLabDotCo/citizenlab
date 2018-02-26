import * as React from 'react';

// router
import { Link, withRouter, WithRouterProps } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import FeatureFlag from 'components/FeatureFlag';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled, { css } from 'styled-components';
import { media } from 'utils/styleUtils';

const Menu = styled.div`
  width: 240px;
  height: 100%;
  position: fixed;
  z-index: 1;
  margin-top: 0px;
  background: #3b3b3b;
  padding-top: 39px;

  ${media.smallerThanMinTablet`
    width: 70px;
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
  fill: #fff;
  opacity: 0.5;
`;

const Text = styled.div`
  color: #fff;
  font-size: 17px;
  font-weight: 400;
  line-height: 21px;
  margin-left: 20px;
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
  location: Location;
};

class Sidebar extends React.PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  constructor(props: Props) {
    super(props as any);
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { pathname } = this.props.location;

    return (
      <Menu>

        <MenuItem active={pathname === '/admin'}>
          <MenuLink to="/admin">
            <IconWrapper><StyledIcon name="analytics" /></IconWrapper>
            <Text>{formatMessage({ ...messages.dashboard })}</Text>
          </MenuLink>
        </MenuItem>

        <MenuItem active={pathname.startsWith('/admin/users')}>
          <MenuLink to="/admin/users">
            <IconWrapper><StyledIcon name="people" /></IconWrapper>
            <Text>{formatMessage({ ...messages.users })}</Text>
          </MenuLink>
        </MenuItem>

        <FeatureFlag name="groups">
          <MenuItem active={pathname.startsWith('/admin/groups')}>
            <MenuLink to="/admin/groups">
              <IconWrapper><StyledIcon name="groups" /></IconWrapper>
              <Text>{formatMessage({ ...messages.groups })}</Text>
            </MenuLink>
          </MenuItem>
        </FeatureFlag>

        <MenuItem active={pathname.startsWith('/admin/projects')}>
          <MenuLink to="/admin/projects" className={'e2e-projects-list-link'}>
            <IconWrapper><StyledIcon name="project" /></IconWrapper>
            <Text>{formatMessage({ ...messages.projects })}</Text>
          </MenuLink>
        </MenuItem>

        <MenuItem active={pathname.startsWith('/admin/ideas')}>
          <MenuLink to="/admin/ideas">
            <IconWrapper><StyledIcon name="idea" /></IconWrapper>
            <Text>{formatMessage({ ...messages.ideas })}</Text>
          </MenuLink>
        </MenuItem>

        <MenuItem active={pathname.startsWith('/admin/settings')}>
          <MenuLink to="/admin/settings/general">
            <IconWrapper><StyledIcon name="settings" /></IconWrapper>
            <Text>{formatMessage({ ...messages.settings })}</Text>
          </MenuLink>
        </MenuItem>

      </Menu>
    );
  }
}

export default withRouter(injectIntl<Props>(Sidebar) as any);
