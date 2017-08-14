import React, { PropTypes } from 'react';
import { push } from 'react-router-redux';
import styled, { ThemeProvider, css } from 'styled-components';
import { lighten } from 'polished';
import { Link } from 'react-router';
import { FormattedMessage, injectIntl } from 'react-intl';
import { injectTracks } from 'utils/analytics';
// import SearchWidget from 'containers/SearchWidget';
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';
import { makeSelectCurrentUserImmutable } from 'utils/auth/selectors';
import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';

import { media } from 'utils/styleUtils';
import messages from './messages';
import tracks from './tracks';
import NotificationMenu from './components/NotificationMenu';
import UserMenu from './components/UserMenu';
import Icon from 'components/UI/Icon';

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  height: 79px;
  position: relative;
  background: ${(props) => props.theme.colorNavBg};
  border-bottom: 1px solid ${(props) => props.theme.colorNavBottomBorder};
  z-index: 999;
  position: fixed;
  top: 0;
`;

const Left = styled.div`
  display: flex;
  z-index: 2;
`;

const subtleSeparator = css`
  border-right: 1px solid ${(props) => props.theme.colorNavSubtle};
`;

const Logo = styled.div`
  cursor: pointer;
  height: 100%;
  padding: 0 25px;
  ${subtleSeparator}
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const NavigationItems = styled.div`
  height: 100%;
  display: flex;
  margin-left: 90px;
  ${media.phone`
    display: none;
  `}
`;

const NavigationItem = styled(Link)`
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
`;

const RightItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 34px;

  &:not(:last-child) {
    ${subtleSeparator}
  }

  ${(props) => props.hideOnPhone && media.phone`display: none;`}
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

class Navbar extends React.Component {
  constructor() {
    super();

    this.state = {
      notificationPanelOpened: false,
    };
  }

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
      colorNavBottomBorder: style.menuStyle === 'light' ? '#EAEAEA' : '#000000',
      colorNavSubtle: style.menuStyle === 'light' ? '#EAEAEA' : '#444444',
      colorNavFg: style.menuStyle === 'light' ? '#000000' : '#FFFFFF',
    };
  }

  render() {
    const { tenantLogo, currentUser, location, className } = this.props;

    return (
      <ThemeProvider theme={this.navbarTheme}>
        <Container className={className}>
          <Left>
            <Link to="/">
              <Logo height="100%" viewBox="0 0 443.04 205.82" secondary={(location === '/')}>
                <img src={tenantLogo} alt="logo"></img>
              </Logo>
            </Link>

            <NavigationItems>
              <NavigationItem to="/" activeClassName="active">
                <FormattedMessage {...messages.pageOverview} />
              </NavigationItem>
              <NavigationItem to="/ideas" activeClassName="active">
                <FormattedMessage {...messages.pageIdeas} />
              </NavigationItem>
              <NavigationItem to="/projects" activeClassName="active">
                <FormattedMessage {...messages.pageProjects} />
              </NavigationItem>
            </NavigationItems>
          </Left>
          <Right>
            <RightItem>
              <Button onClick={this.goTo('/ideas/new')}>
                <ButtonIcon name="add_circle" viewBox="0 0 24 24" />
                <ButtonText>
                  <FormattedMessage {...messages.addIdea} />
                </ButtonText>
              </Button>
            </RightItem>

            {currentUser &&
              <RightItem hideOnPhone>
                <NotificationMenu />
              </RightItem>
            }

            {currentUser &&
              <RightItem hideOnPhone>
                <UserMenu />
              </RightItem>
            }

            {!currentUser &&
              <RightItem hideOnPhone>
                <Link to="/sign-in">
                  <ButtonText>
                    <FormattedMessage {...messages.login} />
                  </ButtonText>
                </Link>
              </RightItem>
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
  goTo: PropTypes.func.isRequired,
  trackClickCloseNotifications: PropTypes.func,
  trackClickOpenNotifications: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  currentUser: makeSelectCurrentUserImmutable(),
  tenantLogo: makeSelectCurrentTenantImm('attributes', 'logo', 'small'),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const goTo = dispatchP.push;
  return Object.assign({}, stateP, { goTo }, ownP);
};

export default injectTracks({
  trackClickOpenNotifications: tracks.clickOpenNotifications,
  trackClickCloseNotifications: tracks.clickCloseNotifications,
})(injectIntl(preprocess(mapStateToProps, { push }, mergeProps)(Navbar)));
