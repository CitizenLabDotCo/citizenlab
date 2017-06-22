/*
 *
 * NotifcationMenu
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Saga } from 'react-redux-saga';
import { createStructuredSelector } from 'reselect';
import makeSelectNotifcationMenu from './selectors';
import defaultSaga from './sagas';
import messages from './messages';

export class NotifcationMenu extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <div>
        <Saga saga={defaultSaga} />
        <FormattedMessage {...messages.header} />
      </div>
    );
  }
}

NotifcationMenu.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  NotifcationMenu: makeSelectNotifcationMenu(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(NotifcationMenu);
