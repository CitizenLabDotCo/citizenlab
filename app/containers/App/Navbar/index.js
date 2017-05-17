import React, { PropTypes } from 'react';
// import { TopBar, TopBarTitle, TopBarLeft, TopBarRight, Menu, MenuItem } from 'components/Foundation';
import { Menu, Button, Dropdown, Icon, Image } from 'semantic-ui-react';
import { Link } from 'react-router';
import { FormattedMessage, injectIntl } from 'react-intl';
import { createStructuredSelector } from 'reselect';

import { push } from 'react-router-redux';

import { preprocess } from 'utils';

import { signOutCurrentUser } from 'utils/auth/actions';
import { makeSelectCurrentUserImmutable } from 'utils/auth/selectors';

import SearchWidget from 'containers/SearchWidget';
import messages from './messages';

class Navbar extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  loginLink() {
    const { goTo } = this.props;
    return [
      <Menu.Item key="login">
        <Button onClick={() => goTo('/sign-in')}>
          <FormattedMessage {...messages.login} />
        </Button>
      </Menu.Item>,
      <Menu.Item key="register">
        <Button onClick={() => goTo('/register')}>
          <FormattedMessage {...messages.register} />
        </Button>
      </Menu.Item>,
    ];
  }

  trigger(currentUser) {
    const avatar = currentUser.getIn(['attributes', 'avatar', 'small']);
    const firstName = currentUser.getIn(['attributes', 'first_name']);
    return (
      <span>
        <Image avatar src={avatar} />
        {firstName}
      </span>
    );
  }

  userMenu(currentUser) {
    const { signOut, goTo } = this.props;
    return (
      <Dropdown item trigger={this.trigger(currentUser)}>
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => goTo('/profile/edit')}>
            <FormattedMessage {...messages.editProfile} />
          </Dropdown.Item>
          <Dropdown.Item>
            <Link onClick={signOut}>Sign out</Link>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  render() {
    const { currentUser, currentTenant, goTo } = this.props;
    return (
      <Menu>
        <Menu.Item>{currentTenant.attributes.name}</Menu.Item>
        <Menu.Item><Link to="/ideas"><FormattedMessage {...messages.ideas} /></Link></Menu.Item>
        <Menu.Item>
          <SearchWidget />
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item >
            <Button primary onClick={() => goTo('/ideas/new')}>
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
  signOut: PropTypes.func.isRequired,
  goTo: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  currentUser: makeSelectCurrentUserImmutable(),
});

const mergeProps = (stateP, dispatchP, ownP) => {
  const signOut = dispatchP.signOutCurrentUser;
  const goTo = dispatchP.push;

  return Object.assign({}, stateP, { signOut, goTo }, ownP);
};


export default injectIntl(preprocess(mapStateToProps, { signOutCurrentUser, push }, mergeProps)(Navbar));
