import React from 'react';
import { Subscription } from 'rxjs';

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import Avatar from 'components/Avatar';
import Popover from 'components/Popover';
import HasPermission from 'components/HasPermission';

// services
import { authUserStream, signOut } from 'services/auth';
import { IUser } from 'services/users';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

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

const OpenMenuButton = styled.button`
  background: none;
  border-radius: 50%;
  border: 0;
  border: 1px solid transparent;
  cursor: pointer;
  height: 27px;
  padding: 0;
  transition: all .2s;
  width: 27px;

  svg {
    fill: ${colors.clGrey};
  }

  &:hover,
  &:focus {
    border-color: ${darken(0.2, colors.clGrey)};

    svg {
      fill: ${darken(0.2, colors.clGrey)};
    }
  }
`;

const UserIcon = styled(Icon)`
  width: 26px;
  height: 24px;
  fill: inherit;
  transition: all 150ms ease;
  cursor: pointer;
`;

const StyledAvatar = styled(Avatar)`
  cursor: pointer;
`;

const StyledPopover = styled(Popover)`
  display: flex;
  flex-direction: column;
  z-index: 5;
`;

const PopoverItem = styled(Button)`
  a:not(.processing):focus,
  button:not(.processing):focus,
  a:not(.processing):hover,
  button:not(.processing):hover {
    background: ${colors.clDropdownHoverBackground};
  }
`;

type Props = {};

type State = {
  authUser: IUser | null;
  opened: boolean;
};

export default class UserMenu extends React.PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      authUser: null,
      opened: false
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      authUser$.subscribe(authUser => this.setState({ authUser }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  togglePopover = (event: React.FormEvent) => {
    event.preventDefault();
    this.setState(({ opened }) => ({ opened: !opened }));
  }

  closePopover = () => {
    this.setState({ opened: false });
  }

  signOut = () => {
    signOut();
  }

  render() {
    const { authUser, opened } = this.state;
    const avatar = (authUser ? authUser.data.attributes.avatar : null);
    const userId = (authUser ? authUser.data.id : null);
    const userSlug = (authUser ? authUser.data.attributes.slug : null);

    if (authUser && userId) {
      return (
        <Container id="e2e-user-menu-container">
          <OpenMenuButton onClick={this.togglePopover}>
            {avatar ?  <StyledAvatar userId={userId} size="small" /> : <UserIcon name="user" />}
          </OpenMenuButton>
          <StyledPopover
            id="e2e-user-menu-dropdown"
            open={opened}
            onCloseRequest={this.closePopover}
          >
            <HasPermission item={{ type: 'route', path: '/admin' }} action="access">
              <PopoverItem
                id="admin-link"
                linkTo={'/admin'}
                onClick={this.closePopover}
                style="text"
                icon="admin"
                iconPos="right"
                iconSize="20px"
                padding="11px 11px"
                justify="space-between"
              >
                <FormattedMessage {...messages.admin} />
              </PopoverItem>

              <HasPermission.No>
                {/* Display the project moderation page for moderators, they don't have access to the dashboard */}
                <HasPermission item={{ type: 'route', path: '/admin/projects' }} action="access">
                  <PopoverItem
                    id="e2e-projects-admin-link"
                    linkTo={'/admin/projects'}
                    onClick={this.closePopover}
                    style="text"
                    icon="admin"
                    iconPos="right"
                    iconSize="20px"
                    padding="11px 11px"
                    justify="space-between"
                  >
                    <FormattedMessage {...messages.projectsModeration} />
                  </PopoverItem>
                </HasPermission>
              </HasPermission.No>
            </HasPermission>

            <PopoverItem
              id="e2e-profile-profile-link"
              linkTo={`/profile/${userSlug}`}
              onClick={this.closePopover}
              style="text"
              icon="user"
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              justify="space-between"
            >
              <FormattedMessage {...messages.profilePage} />
            </PopoverItem>

            <PopoverItem
              id="e2e-profile-edit-link"
              linkTo={'/profile/edit'}
              onClick={this.closePopover}
              style="text"
              icon="settings"
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              justify="space-between"
            >
              <FormattedMessage {...messages.editProfile} />
            </PopoverItem>

            <PopoverItem
              id="e2e-sign-out-link"
              onClick={this.signOut}
              style="text"
              icon="power"
              iconPos="right"
              iconSize="20px"
              padding="11px 11px"
              justify="space-between"
            >
              <FormattedMessage {...messages.signOut} />
            </PopoverItem>
          </StyledPopover>
        </Container>
      );
    }

    return null;
  }
}
