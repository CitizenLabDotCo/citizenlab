/*
 *
 * SignInPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';
import { FormattedMessage } from 'react-intl';
import { Saga } from 'react-redux-saga';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';

import messages from './messages';
import { signInUserSuccessWatcher } from './sagas';

import FacebookAuthButton from 'components/forms/facebookAuthButton';
import RegisterButton from './components/registerButton';
import Form from './components/form';
import { connect } from 'react-redux';

export class SignInPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  render() {
    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />

        <Saga saga={signInUserSuccessWatcher} />

        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <Form />
        <button onClick={this.props.recoverPassword}>
          <FormattedMessage {...messages.recoverPassword} />
        </button>
        <RegisterButton />
        <FacebookAuthButton type={'login'} />

      </div>

    );
  }
}

SignInPage.propTypes = {
  recoverPassword: PropTypes.func.isRequired,
};


const mapDispatchToProps = (dispatch) => bindActionCreators({
  recoverPassword() {
    return push('/sign-in/recover-password');
  },
}, dispatch);

export default connect(null, mapDispatchToProps)(SignInPage);
