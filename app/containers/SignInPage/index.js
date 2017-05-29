/*
 *
 * SignInPage
 *
 */

import React from 'react';
import HelmetIntl from 'components/HelmetIntl';
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
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
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
