import React, { PropTypes } from 'react';
// import { TopBar, TopBarTitle, TopBarLeft, TopBarRight, Menu, MenuItem } from 'components/Foundation';
import { Menu, Input, Button, Dropdown, Icon, Image } from 'semantic-ui-react';
import { Link } from 'react-router';
import { FormattedMessage, injectIntl } from 'react-intl';
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
    return (
      <span>
        <Image avatar src={currentUser.attributes.avatar.small} />
        {currentUser.attributes.first_name}
      </span>
    );
  }

  userMenu(currentUser) {
    return (
      <Dropdown item trigger={this.trigger(currentUser)}>
        <Dropdown.Menu>
          <Dropdown.Item>
            <Link to="/profile/edit"><FormattedMessage {...messages.editProfile} /></Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Link>Sign out</Link>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { currentUser, currentTenant } = this.props;
    return (
      <Menu>
        <Menu.Item>{currentTenant.attributes.name}</Menu.Item>
        <Menu.Item><Link to="/ideas"><FormattedMessage {...messages.ideas} /></Link></Menu.Item>
        <Menu.Item>
          <Input className="icon" icon="search" placeholder={formatMessage({ ...messages.search })} />
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item>
            <Button as="a" primary>
              <Icon name="plus" />
              <FormattedMessage {...messages.addIdea} />
            </Button>
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
  intl: PropTypes.object,
};

export default injectIntl(Navbar);
