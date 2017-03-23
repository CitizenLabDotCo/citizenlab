/*
 *
 * LoginPage
 *
 */

import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import makeSelectLoginPage from './selectors';
import messages from './messages';
import SocialLoginBox from './SocialLoginBox';
import Form from './Form';
import { userLogin } from './actions';
import socialAuth from '../../socialAuth';

const Box = styled.div`
  padding: 20px;
  border: 1px solid #888;
  margin-bottom: 20px;
`;

export const LoggedInAsBox = () => (
  <Box>
    { socialAuth('facebook').isLoggedIn() ? 'logged in? yes' : 'logged in? no' }
  </Box>
);

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

        <Box>
          <Form onSubmit={this.props.onSubmit} />
        </Box>

        <SocialLoginBox onChange={() => this.forceUpdate()} />
      </div>
    );
  }
}

LoginPage.propTypes = {
  onSubmit: React.PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  LoginPage: makeSelectLoginPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    onSubmit: (values) => dispatch(userLogin(values)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
