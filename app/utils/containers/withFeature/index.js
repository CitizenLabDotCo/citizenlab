/*
 *
 * WithFeature
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { Authorize } from 'utils/containers/authorizer';
import { makeSelectCurrentTenantImm } from 'utils/tenant/selectors';

const authorizations = {
  feature: (featureObj) => featureObj && featureObj.get('allowed') && featureObj.get('enabled'),
};

class WithFeature extends React.Component {
  render() {
    const { featureObj } = this.props;
    return <Authorize action={['feature']} authorizations={authorizations} resource={featureObj} />;
  }
}

WithFeature.propTypes = {
  featureObj: PropTypes.object,
};

const mapStateToProps = () => createStructuredSelector({
  featureObj: (state, { feature }) => makeSelectCurrentTenantImm(feature)(state),
});

const exportedComponent = connect(mapStateToProps)(WithFeature);

export default exportedComponent;
export { exportedComponent as Without };
