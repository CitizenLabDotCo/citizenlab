import React, { PropTypes } from 'react';
import { push } from 'react-router-redux';

// components
import { Menu, Button, Dropdown, Icon, Image } from 'semantic-ui-react';
import { Link } from 'react-router';
import { FormattedMessage, injectIntl } from 'react-intl';
import SearchWidget from 'containers/SearchWidget';

// components - authorizations
import Authorize from 'utils/containers/authorize';

// store
import { createStructuredSelector } from 'reselect';
import { preprocess } from 'utils';

import { signOutCurrentUser } from 'utils/auth/actions';
import { makeSelectCurrentUserImmutable } from 'utils/auth/selectors';

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
          <Authorize action={['users', 'admin']} >
            <Dropdown.Item onClick={() => goTo('/admin')}>
              <FormattedMessage {...messages.admin} />
            </Dropdown.Item>
          </Authorize>
          <Dropdown.Item onClick={() => goTo('/profile/edit')}>
            <FormattedMessage {...messages.editProfile} />
          </Dropdown.Item>
          <Dropdown.Item onClick={signOut}>
            <FormattedMessage {...messages.signOut} />
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
        <Menu.Item><Link to="/projects"><FormattedMessage {...messages.projects} /></Link></Menu.Item>
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
