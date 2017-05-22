/*
 *
 * ResetUserPassword
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { Saga } from 'react-redux-saga';
import { createStructuredSelector } from 'reselect';
import makeSelectResetUserPassword from './selectors';
import defaultSaga from './sagas';
import messages from './messages';

export class ResetUserPassword extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Helmet
          title="ResetUserPassword"
          meta={[
            { name: 'description', content: 'Description of ResetUserPassword' },
          ]}
        />
        <Saga saga={defaultSaga} />
        <FormattedMessage {...messages.header} />
      </div>
    );
  }
}

ResetUserPassword.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ResetUserPassword: makeSelectResetUserPassword(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ResetUserPassword);
