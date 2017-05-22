/*
 *
 * SignInPage
 *
 */

import React from 'react';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { Saga } from 'react-redux-saga';

import messages from './messages';
import { signInUserSuccessWatcher } from './sagas';

import FacebookAuthButton from 'components/forms/facebookAuthButton';
import RegisterButton from './components/registerButton';
import Form from './components/form';

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

        <Saga saga={signInUserSuccessWatcher} />

        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <Form />
        <RegisterButton />
        <FacebookAuthButton type={'login'} />

      </div>

    );
  }
}

export default SignInPage;
