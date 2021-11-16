import React, { PureComponent, lazy, Suspense } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';

// components
import Avatar from 'components/Avatar';
import User from './User';
const UserMenuDropdown = lazy(() => import('./UserMenuDropdown'));

// services
import { signOut } from 'services/auth';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { darken } from 'polished';

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

  toggleDropdown = () => {
    this.setState(({ opened }) => ({ opened: !opened }));
  };

  closeDropdown = () => {
    this.setState({ opened: false });
  };

  signOut = () => {
    signOut();
  };

  render() {
    const { authUser } = this.props;

    if (!isNilOrError(authUser)) {
      const { opened } = this.state;
      const userId = authUser.id;
      const isVerified = !!authUser.attributes.verified;

      return (
        <Container
          id="e2e-user-menu-container"
          className={
            authUser.attributes.verified ? 'e2e-verified' : 'e2e-not-verified'
          }
        >
          <DropdownButton
            onMouseDown={removeFocusAfterMouseClick}
            onClick={this.toggleDropdown}
            aria-expanded={opened}
          >
            <User userId={userId} isVerified={isVerified} />
          </DropdownButton>

          <Suspense fallback={null}>
            <UserMenuDropdown
              opened={opened}
              toggleDropdown={this.toggleDropdown}
              closeDropdown={this.closeDropdown}
            />
          </Suspense>
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
