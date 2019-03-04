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
import styled from 'styled-components';
import { colors, media, fontSizes } from 'utils/styleUtils';

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
  color: ${({ theme }) => theme.colorText};
  margin-right: 3px;
  white-space: nowrap;
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  transition: all 100ms ease-out;

  &:hover {
    color: ${({ theme }) => theme.colorText};
  }

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const OpenDropdownButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding: 0px;
  margin: 0px;

  &:hover,
  &:focus {
    ${StyledUserName} {
      color: #000;
    }
  }

  &:focus {
    outline: none;
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

type Props = {};

type State = {
  authUser: IUser | null;
  opened: boolean;
};

export default class UserMenu extends PureComponent<Props, State> {
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

  render() {
    const { authUser, opened } = this.state;
    const userId = (authUser ? authUser.data.id : null);
    const userSlug = (authUser ? authUser.data.attributes.slug : null);

    if (authUser && userId) {
      return (
        <Container id="e2e-user-menu-container">
          <OpenDropdownButton onClick={this.toggleDropdown}>
            <StyledUserName
              user={authUser.data}
              hideLastName={true}
            />
            <Avatar
              userId={userId}
              size="30px"
              hasHoverEffect={true}
              fillColor={colors.label}
            />
          </OpenDropdownButton>

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
                <HasPermission item={{ type: 'route', path: '/admin' }} action="access">
                  <DropdownListItem
                    id="admin-link"
                    linkTo={'/admin'}
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

                  <HasPermission.No>
                    <HasPermission item={{ type: 'route', path: '/admin/projects' }} action="access">
                      <DropdownListItem
                        id="e2e-projects-admin-link"
                        linkTo={'/admin/projects'}
                        onClick={this.closeDropdown}
                        style="text"
                        icon="admin"
                        iconPos="right"
                        iconSize="20px"
                        padding="11px 11px"
                        justify="space-between"
                      >
                        <FormattedMessage {...messages.projectsModeration} />
                      </DropdownListItem>
                    </HasPermission>
                  </HasPermission.No>
                </HasPermission>

                <DropdownListItem
                  id="e2e-my-ideas-page-link"
                  linkTo={`/profile/${userSlug}`}
                  onClick={this.closeDropdown}
                  style="text"
                  icon="ideas2"
                  iconPos="right"
                  iconSize="20px"
                  padding="11px 11px"
                  justify="space-between"
                >
                  <FormattedMessage {...messages.myIdeas} />
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
