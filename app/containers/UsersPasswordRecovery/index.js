/*
 *
 * UsersPasswordRecovery
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { Saga } from 'react-redux-saga';
import { createStructuredSelector } from 'reselect';
import makeSelectUsersPasswordRecovery from './selectors';
import defaultSaga from './sagas';
import messages from './messages';

export class UsersPasswordRecovery extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Helmet
          title="UsersPasswordRecovery"
          meta={[
            { name: 'description', content: 'Description of UsersPasswordRecovery' },
          ]}
        />
        <Saga saga={defaultSaga} />
        <FormattedMessage {...messages.header} />
      </div>
    );
  }
}

UsersPasswordRecovery.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  UsersPasswordRecovery: makeSelectUsersPasswordRecovery(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersPasswordRecovery);
