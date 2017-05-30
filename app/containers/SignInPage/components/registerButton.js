import React from 'react';
import PropTypes from 'prop-types';
import { Message } from 'semantic-ui-react';
import { preprocess } from 'utils';
import { FormattedMessage } from 'react-intl';
import messages from '../messages';

import { push } from 'react-router-redux';

const RegisterButton = ({ goTo }) => (
  <Message>
    <FormattedMessage {...messages.noAccountYet} />
    {' '}
    <a href={'#'} onClick={() => goTo('/register')}>
      <FormattedMessage {...messages.signUpNow} />
    </a>
  </Message>
);

RegisterButton.propTypes = {
  goTo: PropTypes.func.isRequired,
};


export default preprocess(null, { goTo: push })(RegisterButton);
