import React from 'react';
import { PropTypes } from 'prop-types';

import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';

const ErrorProvider = ({ action, error, children }) => {
  const actionName = action.split('/').slice(-1)[0];
  return React.cloneElement(React.Children.only(children), { error, action: actionName });
};

ErrorProvider.PropTypes = {
  error: PropTypes.string,
  children: PropTypes.element.isRequired,
};

const mapStateToProps = () => createStructuredSelector({
  error: (state, { action }) => state.getIn(['errors'].concat(action)),
});

export default connect(mapStateToProps)(ErrorProvider);
