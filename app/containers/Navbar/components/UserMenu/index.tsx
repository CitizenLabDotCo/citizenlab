import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { browserHistory } from 'react-router';

// components
import Authorize from 'utils/containers/authorize';
import ClickOutside from 'utils/containers/clickOutside';
import Icon from 'components/UI/Icon';
import Avatar from 'components/Avatar';

// services
import { authUserStream, signOut } from 'services/auth';
import { IUser } from 'services/users';

// animation
import TransitionGroup from 'react-transition-group/TransitionGroup';
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { darken } from 'polished';

// i18n
import { FormattedMessage } from 'react-intl';
import messages from '../../messages';

// images
const adminIcon = require('./adminIcon.svg');
const editProfileIcon = require('./editProfileIcon.svg');
const signOutIcon = require('./signOutIcon.svg');

const timeout = 200;
const easing = `cubic-bezier(0.19, 1, 0.22, 1)`;

const Container = styled(ClickOutside)`
  display: flex;
  margin-left: 0px;
  position: relative;
  cursor: pointer;
  outline: none;

  * {
    user-select: none;
  }
`;

const StyledAvatar = styled(Avatar)`
  width: 25px;
  height: 25px;
  cursor: pointer;

  &:hover svg {
    fill: ${(props) => darken(0.2, '#84939E')};
  }
`;

const IconWrapper = styled.div`
  width: 26px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserIcon = styled(Icon)`
  height: 100%;
  fill: #84939E;
  transition: all 150ms ease;

  &:hover {
    fill: ${(props) => darken(0.2, '#84939E')};
  }
`;

const Dropdown = styled.div`
  min-width: 200px;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 42px;
  right: -10px;
  z-index: 1;
  padding: 8px;
  background: #fff;
  padding: 6px;
  border-radius: 5px;
  box-sizing: border-box;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.12);
  border: solid 1px #e0e0e0;
  will-change: opacity, transform;
  transform-origin: right top;

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
    right: 11px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    right: 10px;
    border-color: transparent transparent #e0e0e0 transparent;
    border-width: 11px;
  }

  &.dropdown-enter {
    opacity: 0;
    transform: scale(0.9);

    &.dropdown-enter-active {
      opacity: 1;
      transform: scale(1);
      transition: all ${timeout}ms ${easing};
    }
  }
`;

const DropdownIcon = styled(Icon)`
  height: 20px;
`;

const DropdownItem = styled.div`
  color: #84939E;
  font-size: 17px;
  font-weight: 400;
  padding: 10px 15px;
  background: #fff;
  border-radius: 5px;
  transition: all 100ms ease-out;
  display: flex;
  align-items: center;

  svg {
    fill: #84939E;
    transition: all 100ms ease-out;
  }

  &:hover {
    background: #f2f2f2;
    color: #000;

    svg {
      fill: #000;
    }
  }

  display: flex;
  justify-content: space-between;
`;

type Props = {};

type State = {
  authUser: IUser | null;
  dropdownOpened: boolean;
};

export default class UserMenu extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      authUser: null,
      dropdownOpened: false
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      authUser$.subscribe(authUser => this.setState({ authUser }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  toggleDropdown = () => {
    this.setState(state => ({ dropdownOpened: !state.dropdownOpened }));
  }

  closeDropdown = () => {
    this.setState({ dropdownOpened: false });
  }

  navigateTo = (path) => () => {
    browserHistory.push(path);
  }

  signOut = () => {
    signOut();
  }

  goToUserProfile = () => {
    const { authUser } = this.state;

    if (authUser) {
      browserHistory.push(`/profile/${authUser.data.attributes.slug}`);
    }
  }

  render() {
    const { authUser, dropdownOpened } = this.state;
    const avatar = (authUser ? authUser.data.attributes.avatar : null);
    const userId = (authUser ? authUser.data.id : null);

    if (authUser && userId) {
      return (
        <Container id="e2e-user-menu-container" onClick={this.toggleDropdown} onClickOutside={this.closeDropdown}>
          {avatar ? <StyledAvatar userId={userId} size="small" /> : <UserIcon name="user" />}
          <TransitionGroup>
            {dropdownOpened &&
              <CSSTransition
                classNames="dropdown"
                key={1}
                timeout={timeout}
                mountOnEnter={true}
                unmountOnExit={true}
                exit={false}
              >
                <Dropdown id="e2e-user-menu-dropdown">
                  <Authorize action={['users', 'admin']} >
                    <DropdownItem id="admin-link" onClick={this.navigateTo('/admin')}>
                      <FormattedMessage {...messages.admin} />
                      <IconWrapper>
                        <DropdownIcon name="admin" />
                      </IconWrapper>
                    </DropdownItem>
                  </Authorize>
                  <DropdownItem id="e2e-profile-profile-link" onClick={this.navigateTo(`/profile/${userId}`)}>
                    <FormattedMessage {...messages.profilePage} />
                    <IconWrapper>
                      <DropdownIcon name="user" />
                    </IconWrapper>
                  </DropdownItem>
                  <DropdownItem id="e2e-profile-edit-link" onClick={this.navigateTo('/profile/edit')}>
                    <FormattedMessage {...messages.editProfile} />
                    <IconWrapper>
                      <DropdownIcon name="settings" />
                    </IconWrapper>
                  </DropdownItem>
                  <DropdownItem id="e2e-sign-out-link" onClick={this.signOut}>
                    <FormattedMessage {...messages.signOut} />
                    <IconWrapper>
                      <DropdownIcon name="power" />
                    </IconWrapper>
                  </DropdownItem>
                </Dropdown>
              </CSSTransition>
            }
          </TransitionGroup>
        </Container>
      );
    }

    return null;
  }
}
