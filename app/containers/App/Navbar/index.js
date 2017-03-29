import React, { PropTypes } from 'react';
import { TopBar, TopBarTitle, TopBarLeft, TopBarRight } from 'components/Foundation/src/components/top-bar';
import { Menu, MenuItem } from 'components/Foundation/src/components/menu';
import { Link } from 'react-router';

export default class Navbar extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { currentUser, currentTenant } = this.props;
    return (
      <TopBar>
        <TopBarTitle>{currentTenant && currentTenant.name}</TopBarTitle>
        <div>
          <TopBarLeft>
            <Menu>
              <MenuItem><Link to="/ideas">Ideas</Link></MenuItem>
            </Menu>
          </TopBarLeft>
          <TopBarRight>
            <Menu>
              <MenuItem><Link to="/ideas/new">+ Idea</Link></MenuItem>
              <MenuItem><a>{currentUser ? currentUser.name : 'Login'}</a></MenuItem>
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
};
