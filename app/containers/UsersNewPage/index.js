/*
 *
 * UsersNewPage
 *
 */

import React from 'react';
import HelmetIntl from 'components/HelmetIntl';
import { FormattedMessage } from 'react-intl';

import SignInButton from './components/signInButton';
import FacebookAuthButton from 'components/forms/facebookAuthButton';
import Form from './components/form';

import messages from './messages';

export class UsersNewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <Form />
        <SignInButton />
        <FacebookAuthButton type={'login'} />
      </div>
    );
  }
}


export default UsersNewPage;
