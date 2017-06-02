import React from 'react';
import PropTypes from 'prop-types';
import HelmetIntl from 'components/HelmetIntl';
import { FormattedMessage } from 'react-intl';
import { Saga } from 'react-redux-saga';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import styled from 'styled-components';

import messages from './messages';
import { signInUserSuccessWatcher } from './sagas';

import FacebookAuthButton from 'components/forms/facebookAuthButton';
import RegisterButton from './components/registerButton';
import Form from './components/form';
import { connect } from 'react-redux';

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  padding-top: 12px;
  padding-bottom: 12px;
  padding-left: 30px;
  padding-right: 30px;
  margin-bottom: 50px;
`;

export class SignInPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  render() {
    return (
      <PageContainer>
        <FormContainer>
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
        </FormContainer>
      </PageContainer>
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
