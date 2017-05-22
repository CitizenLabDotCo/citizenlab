import React from 'react';
import PropTypes from 'prop-types';
import { preprocess } from 'utils';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

import { push } from 'react-router-redux';

const types = {
  login: ['noAccountYet', 'signUpNow'],
  register: 'authLoginButtonFacebook',
}

const LocalAuthButton = ({ facebookAuth, type }) => (
  <Message>
    <FormattedMessage {...messages.noAccountYet} />
    {' '}
    <a href={'/'}><FormattedMessage {...messages.signUpNow} /></a>
  </Message>
);

LocalAuthButton.propTypes = {
  goTo: PropTypes.func.isRequired,
};


export default preprocess(null, { goTo: push })(FacebookAuthButton);
