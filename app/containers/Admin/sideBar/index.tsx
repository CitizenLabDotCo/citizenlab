import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { browserHistory, Link } from 'react-router';
import { Location } from 'history';

// components
import Icon from 'components/UI/Icon';
// import { Image, Menu } from 'semantic-ui-react';

// i18n
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled, { css } from 'styled-components';

const Menu = styled.div`
  height: 100%;
  width: 100%;
  position: fixed;
  z-index: 1;
  margin-top: -69px;
  background: #3b3b3b;
  padding-top: 30px;
  border-radius: 0 !important;
`;

const StyledIcon = styled(Icon)`
  height: 15px;
  fill: #fff;
`;

const Text = styled.div`
  color: #fff;
  font-size: 17px;
  font-weight: 400;
  line-height: 22px;
  margin-left: 20px;
`;

const MenuItem: any = styled(Link)`
  background: transparent;

  &:hover {
    background: #232323;

    ${StyledIcon} {
      fill: #fff;
    };

    ${Text} {
      color: #fff;
    };
  }

  ${(props: any) => props.active && css`
    background: #232323;

    ${StyledIcon} {
      fill: #fff;
    };

    ${Text} {
      color: #fff;
    };
  `}

  /*
  ::before,
  ::after {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }

  ::after {
    top: -20px;
    right: 20px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  > a:after {
    width: 12px;
    height: 12px;
    transform: rotate(-315deg);
    background-color: #f2f2f2;
    content: '';
    position: relative;
    margin-top: -15px;
    display: ${(props: any) => props.active ? 'block' : 'none'};
    margin-left: calc(100% + 16px)
  }
  */
`;

type Props = {};

type State = {
  location: Location;
};

class Sidebar extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  unlisten: Function | null;

  constructor() {
    super();
    this.state = {
      location: browserHistory.getCurrentLocation()
    };
    this.unlisten = null;
  }

  componentDidMount() {
    this.unlisten = browserHistory.listen((location: Location) => {
      this.setState({ location });
    });
  }

  componentWillUnmount() {
    if (this.unlisten) {
      this.unlisten();
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { location } = this.state;
    const { pathname } = location;

    return (
      <Menu>

        <MenuItem active={pathname === '/admin'} to="/admin">
          <StyledIcon name="analytics" />
          <Text>{formatMessage({ ...messages.dashboard })}</Text>
        </MenuItem>

        <MenuItem active={pathname === '/admin/users'} to="/admin/users">
          <StyledIcon name="people" />
          <Text>{formatMessage({ ...messages.users })}</Text>
        </MenuItem>

        <MenuItem active={pathname === '/admin/groups'} to="/admin/groups">
          <StyledIcon name="groups" />
          <Text>{formatMessage({ ...messages.groups })}</Text>
        </MenuItem>

        <MenuItem active={pathname === '/admin/projects'} to="/admin/projects">
          <StyledIcon name="project" />
          <Text>{formatMessage({ ...messages.projects })}</Text>
        </MenuItem>

        <MenuItem active={pathname === '/admin/ideas'} to="/admin/ideas">
          <StyledIcon name="idea" />
          <Text>{formatMessage({ ...messages.ideas })}</Text>
        </MenuItem>

        <MenuItem active={pathname === '/admin/settings'} to="/admin/settings">
          <StyledIcon name="settings" />
          <Text>{formatMessage({ ...messages.settings })}</Text>
        </MenuItem>

      </Menu>
    );
  }
}

export default injectIntl<Props>(Sidebar);
