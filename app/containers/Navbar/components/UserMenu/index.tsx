import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';

// components
import Button from 'components/UI/Button';
import Avatar from 'components/Avatar';
import UserName from 'components/UI/UserName';
import Dropdown from 'components/UI/Dropdown';
import HasPermission from 'components/HasPermission';

// services
import { authUserStream, signOut } from 'services/auth';
import { IUser } from 'services/users';

// style
import styled, { withTheme } from 'styled-components';
import { colors, media, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const Container = styled.div`
  display: flex;
  position: relative;
  height: 100%;

  * {
    user-select: none;
  }
`;

const StyledUserName = styled(UserName)`
  color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
  margin-right: 3px;
  white-space: nowrap;
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  transition: all 100ms ease-out;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const StyledAvatar = styled(Avatar)``;

const DropdownButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding: 0px;
  margin: 0px;

  &:hover,
  &:focus {
    ${StyledUserName} {
      color: ${({ theme }) => theme.navbarTextColor ? darken(0.2, theme.navbarTextColor) : colors.text};
    }

    ${StyledAvatar} {
      .avatarIcon {
        fill: ${({ theme }) => theme.navbarTextColor ? darken(0.2, theme.navbarTextColor) : colors.text};
      }
    }
  }
`;

const DropdownListItem = styled(Button)`
  &.Button.button {
    font-size: ${fontSizes.medium}px;
  }
  a:not(.processing):focus,
  button:not(.processing):focus,
  a:not(.processing):hover,
  button:not(.processing):hover {
    background: ${colors.clDropdownHoverBackground};
  }
`;

type Props = {
  theme: any;
};

type State = {
  authUser: IUser | null;
  opened: boolean;
};

class UserMenu extends PureComponent<Props, State> {
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

  toggleDropdown = (event: React.FormEvent) => {
    event.preventDefault();
    this.setState(({ opened }) => ({ opened: !opened }));
  }

  closeDropdown = () => {
    this.setState({ opened: false });
  }

  signOut = () => {
    signOut();
  }

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  render() {
    const { theme } = this.props;
    const { authUser, opened } = this.state;
    const userId = (authUser ? authUser.data.id : null);
    const userSlug = (authUser ? authUser.data.attributes.slug : null);

    if (authUser && userId) {
      return (
        <Container id="e2e-user-menu-container">
          <DropdownButton
            onMouseDown={this.removeFocus}
            onClick={this.toggleDropdown}
          >
            <StyledUserName
              userId={userId}
              hideLastName
            />
            <StyledAvatar
              userId={userId}
              size="30px"
              hasHoverEffect={false}
              fillColor={theme.navbarTextColor || colors.label}
            />
          </DropdownButton>

          <Dropdown
            id="e2e-user-menu-dropdown"
            width="220px"
            mobileWidth="220px"
            top="68px"
            right="-12px"
            mobileRight="-5px"
            opened={opened}
            onClickOutside={this.toggleDropdown}
            content={(
              <>
                <HasPermission item={{ type: 'route', path: '/admin/dashboard' }} action="access">
                  <DropdownListItem
                    id="admin-link"
                    linkTo={'/admin/dashboard'}
                    onClick={this.closeDropdown}
                    style="text"
                    icon="admin"
                    iconPos="right"
                    iconSize="20px"
                    padding="11px 11px"
                    justify="space-between"
                  >
                    <FormattedMessage {...messages.admin} />
                  </DropdownListItem>
                </HasPermission>

                <DropdownListItem
                  id="e2e-my-ideas-page-link"
                  linkTo={`/profile/${userSlug}`}
                  onClick={this.closeDropdown}
                  style="text"
                  icon="profile1"
                  iconPos="right"
                  iconSize="20px"
                  padding="11px 11px"
                  justify="space-between"
                >
                  <FormattedMessage {...messages.myProfile} />
                </DropdownListItem>

                <DropdownListItem
                  id="e2e-profile-edit-link"
                  linkTo={'/profile/edit'}
                  onClick={this.closeDropdown}
                  style="text"
                  icon="settings"
                  iconPos="right"
                  iconSize="20px"
                  padding="11px 11px"
                  justify="space-between"
                >
                  <FormattedMessage {...messages.editProfile} />
                </DropdownListItem>

                <DropdownListItem
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
                </DropdownListItem>
              </>
            )}
          />
        </Container>
      );
    }

    return null;
  }
}

export default withTheme(UserMenu);
