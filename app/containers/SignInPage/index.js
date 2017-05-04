/*
 *
 * SignInPage
 *
 */

import React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import T from 'containers/T';
import { Saga } from 'react-redux-saga';
import makeSelectSignInPage from './selectors';
import messages from './messages';
import Form from './Form';
import { emailSaga, socialSaga } from './sagas';
import { authenticateEmailRequest, authenticateSocialRequest } from './actions';
import { NETWORK_FACEBOOK } from './constants';


export class SignInPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  render() {
    return (
      <div>
        <Helmet
          title="SignInPage"
          meta={[
            { name: 'description', content: 'Description of SignInPage' },
          ]}
        />

        <Saga saga={emailSaga} />
        <Saga saga={socialSaga} />

        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <Form onSubmit={this.props.onSubmit} errors={{}} >
          <div style={{ marginTop: '1em', width: '100%', display: 'block' }}>
            <button className="ui facebook button" onClick={this.props.onFacebookSubmit} style={{ width: '100%' }}>
              <i className="facebook icon"></i>
              <T value={messages.facebookSignIn} />
            </button>
          </div>
        </Form>
      </div>
    );
  }
}

SignInPage.propTypes = {
  onSubmit: React.PropTypes.func,
  onFacebookSubmit: React.PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  SignInPage: makeSelectSignInPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    onSubmit: (values) => dispatch(authenticateEmailRequest(values)),
    onFacebookSubmit: () => dispatch(authenticateSocialRequest(NETWORK_FACEBOOK)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInPage);
