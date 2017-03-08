/*
 *
 * LoginPage
 *
 */

import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import makeSelectLoginPage from './selectors';
import messages from './messages';
import { Button } from '../../components/Foundation';
import socialAuth from './../../socialAuth';

const LoginsDiv = styled.div`
  padding: 20px;
  border: 1px solid #888;
`;

export class LoginPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Helmet
          title="LoginPage"
          meta={[
            { name: 'description', content: 'Description of LoginPage' },
          ]}
        />

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

LoginButton.propTypes = {
  label: React.PropTypes.string,
  after: React.PropTypes.any,
};

LogoutButton.propTypes = {
  after: React.PropTypes.any,
};

LoginPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  LoginPage: makeSelectLoginPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
