import React, { PropTypes } from 'react';
// import { TopBar, TopBarTitle, TopBarLeft, TopBarRight, Menu, MenuItem } from 'components/Foundation';
import { Menu, Button, Dropdown, Icon, Image } from 'semantic-ui-react';
import { Link } from 'react-router';
import { FormattedMessage, injectIntl } from 'react-intl';
import { createStructuredSelector } from 'reselect';

import { preprocess } from 'utils';

import { signOutCurrentUser as signOutAction } from 'utils/auth/actions';
import { makeSelectCurrentUserImmutable } from 'utils/auth/selectors';

import SearchWidget from 'containers/SearchWidget';
import messages from './messages';

class Navbar extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  loginLink() {
    return [
      <Menu.Item key="login">
        <Button><Link to="/sign-in">Login</Link></Button>
      </Menu.Item>,
      <Menu.Item key="register">
        <Button><Link to="/register">Register</Link></Button>
      </Menu.Item>,
    ];
  }

  trigger(currentUser) {
    const avatar = currentUser.getIn(['attributes', 'avatar', 'small']);
    const first_name = currentUser.getIn(['attributes', 'first_name']);
    return (
      <span>
        <Image avatar src={avatar} />
        {first_name}
      </span>
    );
  }

  userMenu(currentUser) {
    const { signOutCurrentUser } = this.props;
    return (
      <Dropdown item trigger={this.trigger(currentUser)}>
        <Dropdown.Menu>
          <Dropdown.Item>
            <Link to="/profile/edit"><FormattedMessage {...messages.editProfile} /></Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Link onClick={signOutCurrentUser}>Sign out</Link>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  render() {
    const { currentUser, currentTenant } = this.props;
    return (
      <Menu>
        <Menu.Item>{currentTenant.attributes.name}</Menu.Item>
        <Menu.Item><Link to="/ideas"><FormattedMessage {...messages.ideas} /></Link></Menu.Item>
        <Menu.Item>
          <SearchWidget />
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item>
            <Link to="/ideas/new">
              <Button primary>
                <Icon name="plus" />
                <FormattedMessage {...messages.addIdea} />
              </Button>
            </Link>
          </Menu.Item>
          {currentUser ? this.userMenu(currentUser) : this.loginLink()}
        </Menu.Menu>
      </Menu>
    );
  }
}

Navbar.propTypes = {
  currentUser: PropTypes.object,
  currentTenant: PropTypes.object.isRequired,
  signOutCurrentUser: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  currentUser: makeSelectCurrentUserImmutable(),
});

export default injectIntl(preprocess(mapStateToProps, { signOutCurrentUser: signOutAction })(Navbar));
