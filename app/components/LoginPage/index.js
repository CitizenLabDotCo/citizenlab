/**
*
* LoginPage
*
*/

import React from 'react';
import styled from 'styled-components';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

import { Button } from '../Foundation';
import socialAuth from './../../socialAuth';

const LoginsDiv = styled.div`
  padding: 20px;
  border: 1px solid #888;
`;

class LoginPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <h4>logged in? { socialAuth('facebook').isLoggedIn() ? 'yes' : 'no' }</h4>

        <LoginsDiv>
          <h3>Login using a social account</h3>

          <LoginButton label="Facebook" after={() => this.forceUpdate()} />
        </LoginsDiv>

        <LogoutButton after={() => this.forceUpdate()} />
      </div>
    );
  }
}

const handleLoginClick = (after) => {
  socialAuth('facebook').login().then(after);
};

const handleLogoutClick = (after) => {
  socialAuth('facebook').logout();
  after();
};

export const LoginButton = (props) => (
  socialAuth('facebook').isLoggedIn() ?
    null :
    <Button className="clLoginBtn" onClick={() => handleLoginClick(props.after)}>{ props.label }</Button>
);

export const LogoutButton = (props) => (
  socialAuth('facebook').isLoggedIn() ?
    <Button onClick={() => handleLogoutClick(props.after)}>Logout</Button> :
    null
);

LoginPage.propTypes = {

};

LoginButton.propTypes = {
  label: React.PropTypes.string,
  after: React.PropTypes.function,
};

LogoutButton.propTypes = {
  after: React.PropTypes.function,
};

export default LoginPage;
