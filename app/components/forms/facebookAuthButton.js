import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { FormattedMessage } from 'react-intl';
import messages from './messages';

import { NETWORK_FACEBOOK } from 'utils/auth/constants';
import { createSocialUserRequest } from 'utils/auth/actions';

const types = {
  register: 'authLoginButtonFacebook',
  login: 'authLoginButtonFacebook',
};

const FacebookAuthButton = ({ facebookAuth, type }) => (
  <div style={{ marginTop: '1em', width: '100%', display: 'block' }}>
    <button className="ui facebook button" onClick={facebookAuth} style={{ width: '100%' }}>
      <i className="facebook icon"></i>
      <FormattedMessage {...messages[types[type]]} />
    </button>
  </div>
);

FacebookAuthButton.propTypes = {
  facebookAuth: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
};

const mapDispatchToProps = (dispatch) => ({ facebookAuth: () => dispatch(createSocialUserRequest(NETWORK_FACEBOOK)) });

export default connect(null, mapDispatchToProps)(FacebookAuthButton);
