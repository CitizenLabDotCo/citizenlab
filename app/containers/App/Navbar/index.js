import React, { PropTypes } from 'react';
import { TopBar, TopBarTitle, TopBarLeft, TopBarRight } from 'components/Foundation/src/components/top-bar';
import { Menu, MenuItem } from 'components/Foundation/src/components/menu';
import { Link } from 'react-router';
import { FormattedMessage, injectIntl } from 'react-intl';
import messages from './messages';

class Navbar extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  loginLink() {
    return [
      <MenuItem key="login"><Link to="/sign-in">Login</Link></MenuItem>,
      <MenuItem key="register"><Link to="/register">Register</Link></MenuItem>,
    ];
  }

  userMenu(currentUser) {
    return (
      <MenuItem>
        <Menu isDropdown>
          <MenuItem>{currentUser.attributes.first_name}</MenuItem>
          <Menu isVertical>
            <MenuItem><Link to="/profile/edit"><FormattedMessage {...messages.editProfile} /></Link></MenuItem>
            <MenuItem><Link>Sign out</Link></MenuItem>
          </Menu>
        </Menu>
      </MenuItem>
    );
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { currentUser, currentTenant } = this.props;
    return (
      <TopBar>
        <TopBarTitle>{currentTenant && currentTenant.name}</TopBarTitle>
        <div>
          <TopBarLeft>
            <Menu>
              <MenuItem><Link to="/ideas"><FormattedMessage {...messages.ideas} /></Link></MenuItem>
              <MenuItem><input type="search" placeholder={formatMessage({ ...messages.search })} /></MenuItem>
            </Menu>
          </TopBarLeft>
          <TopBarRight>
            <Menu>
              <MenuItem><Link to="/ideas/new"><FormattedMessage {...messages.addIdea} /></Link></MenuItem>
              {currentUser ? this.userMenu(currentUser) : this.loginLink()}
            </Menu>
          </TopBarRight>
        </div>
      </TopBar>
    );
  }
}

Navbar.propTypes = {
  currentUser: PropTypes.object,
  currentTenant: PropTypes.object,
  intl: PropTypes.object,
};

export default injectIntl(Navbar);
