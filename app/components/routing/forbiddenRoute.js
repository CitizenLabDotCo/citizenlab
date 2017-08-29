import React from 'react';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import { preprocess } from 'utils';

class ForbiddenRoute extends React.Component {
  componentDidMount() {
    this.props.goTo('/sign-in');
  }

  render() {
    return null;
  }
}

ForbiddenRoute.propTypes = {
  goTo: PropTypes.func.isRequired,
};

export default preprocess(null, { goTo: push })(ForbiddenRoute);
