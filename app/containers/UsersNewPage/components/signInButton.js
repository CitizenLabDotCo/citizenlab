import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';
import { preprocess } from 'utils';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';

import { push } from 'react-router-redux';

const SignInButton = ({ goTo }) => (
  <Message>
    <FormattedMessage {...messages.alreadyRegistered} />
    {' '}
    <a href={'#'} onClick={() => goTo('/sign-in')}>
      <FormattedMessage {...messages.buttonRegister} />
    </a>
  </Message>
);

SignInButton.propTypes = {
  goTo: PropTypes.func.isRequired,
};

export default preprocess(null, { goTo: push })(SignInButton);
