import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import Avatar from 'components/Avatar';
import { Dropdown } from 'cl2-component-library';
import HasPermission from 'components/HasPermission';
import User from './User';

// services
import { signOut } from 'services/auth';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const Container = styled.div`
  height: 100%;
  display: flex;
  position: relative;
`;

const StyledAvatar = styled(Avatar)``;

const DropdownButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding: 0px;
  padding-top: 2px;
  margin: 0px;

  &:hover,
  &:focus {
    ${StyledAvatar} {
      .avatarIcon {
        fill: ${({ theme }) =>
          theme.navbarTextColor
            ? darken(0.2, theme.navbarTextColor)
            : colors.text};
      }
    }
  }
`;

const DropdownListItem = styled(Button)``;

interface InputProps {
  theme?: any;
  className?: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  opened: boolean;
}

class UserMenu extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      opened: false,
    };
  }

  toggleDropdown = (event: React.FormEvent) => {
    event.preventDefault();
    this.setState(({ opened }) => ({ opened: !opened }));
  };

  closeDropdown = () => {
    this.setState({ opened: false });
  };

  signOut = () => {
    signOut();
  };

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  render() {
    const { authUser } = this.props;

    if (!isNilOrError(authUser)) {
      const { opened } = this.state;
      const userId = authUser.id;
      const userSlug = authUser.attributes.slug;
      const isVerified = !!authUser.attributes.verified;

      return (
        <Container
          id="e2e-user-menu-container"
          className={
            authUser.attributes.verified ? 'e2e-verified' : 'e2e-not-verified'
          }
        >
          <DropdownButton
            onMouseDown={this.removeFocus}
            onClick={this.toggleDropdown}
            aria-expanded={opened}
          >
            <User userId={userId} isVerified={isVerified} />
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
            content={
              <>
                <HasPermission
                  item={{ type: 'route', path: '/admin/dashboard' }}
                  action="access"
                >
                  <DropdownListItem
                    id="admin-link"
                    linkTo={'/admin/dashboard'}
                    onClick={this.closeDropdown}
                    buttonStyle="text"
                    bgHoverColor={colors.clDropdownHoverBackground}
                    icon="admin"
                    iconAriaHidden
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
                  buttonStyle="text"
                  bgHoverColor={colors.clDropdownHoverBackground}
                  icon="profile1"
                  iconAriaHidden
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
                  buttonStyle="text"
                  bgHoverColor={colors.clDropdownHoverBackground}
                  icon="settings"
                  iconAriaHidden
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
                  buttonStyle="text"
                  bgHoverColor={colors.clDropdownHoverBackground}
                  icon="power"
                  iconAriaHidden
                  iconPos="right"
                  iconSize="20px"
                  padding="11px 11px"
                  justify="space-between"
                >
                  <FormattedMessage {...messages.signOut} />
                </DropdownListItem>
              </>
            }
          />
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
});

export default (inputProps: InputProps) => (
  <Data>{(dataProps) => <UserMenu {...inputProps} {...dataProps} />}</Data>
);
