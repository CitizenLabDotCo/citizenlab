/*
 *
 * LoginPage
 *
 */

// TODO enable eslint
/* eslint-disable */
import React, { PropTypes } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import makeSelectLoginPage from './selectors';
import messages from './messages';
import SocialLoginBox from './SocialLoginBox';
import LoggedInAsBox from './LoggedInAsBox';
import LoginFormBox from './LoginFormBox';
import { userLogin } from './actions';

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

        <LoggedInAsBox />

        <LoginFormBox onSubmit={this.props.onLoginFormSubmit} />

        <SocialLoginBox onChange={() => this.forceUpdate()} />
      </div>
    );
  }
}

LoginPage.propTypes = {
};

const mapStateToProps = createStructuredSelector({
  LoginPage: makeSelectLoginPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    onLoginFormSubmit: (values) => dispatch(userLogin(values)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
