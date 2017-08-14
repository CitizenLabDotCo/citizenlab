import React, { PropTypes } from 'react';
import { push } from 'react-router-redux';
import styled, { ThemeProvider } from 'styled-components';
import { lighten } from 'polished';
import { Link } from 'react-router';
import { FormattedMessage, injectIntl } from 'react-intl';
import { injectTracks } from 'utils/analytics';
// import SearchWidget from 'containers/SearchWidget';
import Authorize from 'utils/containers/authorize';
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { signOutCurrentUser } from 'utils/auth/actions';
import { makeSelectCurrentUserImmutable } from 'utils/auth/selectors';
import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';
import ClickOutside from 'utils/containers/clickOutside';
import messages from './messages';
import tracks from './tracks';
import NotificationMenu from 'containers/NotificationMenu';
import NotificationCount from 'containers/NotificationMenu/components/NotificationCount';
import Icon from 'components/UI/Icon';

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 0;
  height: 80px;
  position: relative;
  background: ${(props) => props.theme.colorNavBg};
  z-index: 999;
  position: fixed;
  top: 0;
`;

const Left = styled.div`
  display: flex;
  z-index: 2;

  > div {
    display: flex;
    align-items: center;
  }
`;

const Logo = styled.div`
  cursor: pointer;
  height: 100%;
  padding: 0 25px;
  border-right: 1px solid ${(props) => props.theme.colorNavSubtle};
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const MenuItems = styled.div`
  height: 100%;
  display: flex;
  margin-left: 90px;
`;

const MenuItem = styled(Link)`
  height: 100%;

  opacity: 0.5;
  transition: opacity 150ms ease;
  &.active, &:hover {
    opacity: 1;
  }

  color: ${(props) => props.theme.colorNavFg} !important;
  font-size: 18px;
  font-weight: 400;

  display: flex;
  align-items: center;
  justify-content: center;
  &:not(:last-child) {
    padding-right: 50px;
  }


`;


const Right = styled.div`
  display: flex;
  z-index: 2;
  align-items: center;

  > div, > a, > button {
    margin-left: 20px;
  }
`;


const Button = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 25px;
  border-radius: 5px;
  background: ${(props) => props.theme.colorMain};
  cursor: pointer;
  transition: all 150ms ease;

  &:not(:last-child) {
    margin-right: 10px;
  }

  &:hover {
    background: ${(props) => lighten(0.1, props.theme.colorMain)};
  }
`;

const ButtonIcon = styled(Icon)`
  fill: #fff;
  margin-right: 20px;
`;

const ButtonText = styled.span`
  color: #fff;
  font-weight: 500;
  font-size: 18px;
  white-space: nowrap;
`;

const User = styled(ClickOutside)`
  display: flex;
  border-radius: 50%;
  margin-left: 0px;
  position: relative;
  cursor: pointer;
`;

const UserImage = styled.img`
  height: 41px;
  border-radius: 50%;
  margin-left: 10px;
  opacity: 0.75;
  transition: opacity 200ms ease;

  &:hover {
    opacity: 1;
  }
`;

const Dropdown = styled.div`
  min-width: 150px;
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 50px;
  right: -5px;
  z-index: 1;
  border-radius: 6px;
  border: solid 1px #ccc;
  overflow: hidden;
`;

const DropdownItem = styled.div`
  color: #666;
  font-size: 15px;
  font-weight: 400;
  padding: 8px 10px;
  border-bottom: solid 1px #eee;
  background: #fff;

  &:last-child {
    border: none;
  }

  &:hover {
    background: #f4f4f4;
  }
`;

const NotificationMenuContainer = styled(ClickOutside)`
  position: relative;
`;

class Navbar extends React.Component {
  constructor() {
    super();

    this.state = {
      dropdownOpened: false,
      notificationPanelOpened: false,
    };
  }

  toggleDropdown = () => {
    this.setState((state) => ({ dropdownOpened: !state.dropdownOpened }));
  };

  closeDropdown = () => {
    this.setState({ dropdownOpened: false });
  };

  goTo = (path) => () => {
    this.props.goTo(path);
  };

  toggleNotificationPanel = () => {
    if (this.state.notificationPanelOpened) {
      this.props.trackClickCloseNotifications();
    } else {
      this.props.trackClickOpenNotifications();
    }

    this.setState({
      notificationPanelOpened: !this.state.notificationPanelOpened,
    });
  };

  closeNotificationPanel = () => {
    // There seem to be some false closing triggers on initializing,
    // so we check whether it's actually open
    if (this.state.notificationPanelOpened) {
      this.props.trackClickCloseNotifications();
    }
    this.setState({ notificationPanelOpened: false });
  };

  navbarTheme = (style) => {
    return {
      ...style,
      colorNavBg: style.menuStyle === 'light' ? '#FFFFFF' : '#222222',
      colorNavSubtle: style.menuStyle === 'light' ? '#EAEAEA' : '#444444',
      colorNavFg: style.menuStyle === 'light' ? '#000000' : '#FFFFFF',
    };
  }

  render() {
    const { tenantLogo, currentUser, location, className } = this.props;
    const avatar = (currentUser ? currentUser.getIn(['attributes', 'avatar', 'large']) : null);

    return (
      <ThemeProvider theme={this.navbarTheme}>
        <Container className={className}>
          <Left>
            <Link to="/">
              <Logo height="100%" viewBox="0 0 443.04 205.82" secondary={(location === '/')}>
                <img src={tenantLogo} alt="logo"></img>
              </Logo>
            </Link>

            <MenuItems>
              <MenuItem to="/" activeClassName="active">
                <FormattedMessage {...messages.pageOverview} />
              </MenuItem>
              <MenuItem to="/ideas" activeClassName="active">
                <FormattedMessage {...messages.pageIdeas} />
              </MenuItem>
              <MenuItem to="/projects" activeClassName="active">
                <FormattedMessage {...messages.pageProjects} />
              </MenuItem>
            </MenuItems>
          </Left>
          <Right>
            <Button onClick={this.goTo('/ideas/new')}>
              <ButtonIcon name="add_circle" viewBox="0 0 24 24" />
              <ButtonText>
                <FormattedMessage {...messages.addIdea} />
              </ButtonText>
            </Button>

            {currentUser &&
              <NotificationMenuContainer onClick={this.toggleNotificationPanel} onClickOutside={this.closeNotificationPanel}>
                <NotificationCount
                  count={currentUser.getIn(['attributes', 'unread_notifications'])}
                />
                <NotificationMenu show={this.state.notificationPanelOpened} />
              </NotificationMenuContainer>
            }

            {currentUser &&
              <User onClick={this.toggleDropdown} onClickOutside={this.closeDropdown}>
                <UserImage avatar src={avatar}></UserImage>
                {this.state.dropdownOpened &&
                  <Dropdown>
                    <Authorize action={['users', 'admin']} >
                      <DropdownItem onClick={this.goTo('/admin')}>
                        <FormattedMessage {...messages.admin} />
                      </DropdownItem>
                    </Authorize>
                    <DropdownItem onClick={this.goTo('/profile/edit')}>
                      <FormattedMessage {...messages.editProfile} />
                    </DropdownItem>
                    <DropdownItem onClick={this.props.signOut}>
                      <FormattedMessage {...messages.signOut} />
                    </DropdownItem>
                  </Dropdown>
                }
              </User>
            }

            {!currentUser &&
              <Button onClick={this.goTo('/register')}>
                <ButtonText>
                  <FormattedMessage {...messages.register} />
                </ButtonText>
              </Button>
            }

            {!currentUser &&
              <Link to="/sign-in">
                <ButtonText>
                  <FormattedMessage {...messages.login} />
                </ButtonText>
              </Link>
            }
          </Right>
        </Container>
      </ThemeProvider>
    );
  }
}

Navbar.propTypes = {
  className: PropTypes.string,
  currentUser: PropTypes.object,
  tenantLogo: PropTypes.string,
  location: PropTypes.string.isRequired,
  signOut: PropTypes.func.isRequired,
  goTo: PropTypes.func.isRequired,
  trackClickCloseNotifications: PropTypes.func,
  trackClickOpenNotifications: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  currentUser: makeSelectCurrentUserImmutable(),
  tenantLogo: makeSelectCurrentTenantImm('attributes', 'logo', 'small'),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const signOut = dispatchP.signOutCurrentUser;
  const goTo = dispatchP.push;
  return Object.assign({}, stateP, { signOut, goTo }, ownP);
};

export default injectTracks({
  trackClickOpenNotifications: tracks.clickOpenNotifications,
  trackClickCloseNotifications: tracks.clickCloseNotifications,
})(injectIntl(preprocess(mapStateToProps, { signOutCurrentUser, push }, mergeProps)(Navbar)));
