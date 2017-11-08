import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { browserHistory } from 'react-router';

// components
import Authorize from 'utils/containers/authorize';
import Icon from 'components/UI/Icon';
import Avatar from 'components/Avatar';
import Popover from 'components/Popover';

// services
import { authUserStream, signOut } from 'services/auth';
import { IUser } from 'services/users';

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


const Container = styled.div`
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

const StyledPopover = styled(Popover)`
  display: flex;
  flex-direction: column;
`;

const PopoverIcon = styled(Icon)`
  height: 20px;
`;

const PopoverItem = styled.div`
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
    fill: ${props => props.theme.colors.label};
    transition: all 100ms ease-out;
  }

  &:hover {
    background: #f4f4f4;
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
  PopoverOpened: boolean;
};

export default class UserMenu extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      authUser: null,
      PopoverOpened: false
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

  togglePopover = () => {
    this.setState(state => ({ PopoverOpened: !state.PopoverOpened }));
  }

  closePopover = () => {
    this.setState({ PopoverOpened: false });
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

  // {/* id="e2e-user-menu-Popover" */}

  render() {
    const { authUser, PopoverOpened } = this.state;
    const avatar = (authUser ? authUser.data.attributes.avatar : null);
    const userId = (authUser ? authUser.data.id : null);

    if (authUser && userId) {
      return (
        <Container id="e2e-user-menu-container" onClick={this.togglePopover}>
          {avatar ? <StyledAvatar userId={userId} size="small" /> : <UserIcon name="user" />}
            <StyledPopover
              id="e2e-user-menu-Popover"
              open={PopoverOpened}
              onCloseRequest={this.closePopover}
            >
              <Authorize action={['users', 'admin']} >
                <PopoverItem id="admin-link" onClick={this.navigateTo('/admin')}>
                  <FormattedMessage {...messages.admin} />
                  <IconWrapper>
                    <PopoverIcon name="admin" />
                  </IconWrapper>
                </PopoverItem>
              </Authorize>
              <PopoverItem id="e2e-profile-profile-link" onClick={this.navigateTo(`/profile/${userId}`)}>
                <FormattedMessage {...messages.profilePage} />
                <IconWrapper>
                  <PopoverIcon name="user" />
                </IconWrapper>
              </PopoverItem>
              <PopoverItem id="e2e-profile-edit-link" onClick={this.navigateTo('/profile/edit')}>
                <FormattedMessage {...messages.editProfile} />
                <IconWrapper>
                  <PopoverIcon name="settings" />
                </IconWrapper>
              </PopoverItem>
              <PopoverItem id="e2e-sign-out-link" onClick={this.signOut}>
                <FormattedMessage {...messages.signOut} />
                <IconWrapper>
                  <PopoverIcon name="power" />
                </IconWrapper>
              </PopoverItem>
            </StyledPopover>
        </Container>
      );
    }

    return null;
  }
}
