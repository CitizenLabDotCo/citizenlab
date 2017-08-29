/*
 *
 * WithFeature
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { makeSelectFeature } from './selectors';

export class WithFeature extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  render() {
    const { featureObject } = this.props;
    if (featureObject && featureObject.get('allowed') && featureObject.get('enabled')) {
      const filteredChildren = React.Children.toArray(this.props.children).filter((c) => c.type !== Without);
      return <div>{filteredChildren}</div> || null;
    }
    const alternative = React.Children.toArray(this.props.children).find((c) => c.type === Without);
    return alternative || null;
  }
}

WithFeature.propTypes = {
  children: React.PropTypes.node,
  featureObject: PropTypes.object,
  feature: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
};

const makeMapStateToProps = () => {
  const selectFeature = makeSelectFeature();
  const mapStateToProps = (state, props) => (
    {
      featureObject: selectFeature(state, props),
    }
  );
  return mapStateToProps;
};

const exportedComponent = connect(makeMapStateToProps())(WithFeature);

export default exportedComponent;

export class Without extends React.PureComponent { // eslint-disable-line react/no-multi-comp
  render() {
    return React.Children.only(this.props.children);
  }
}
Without.propTypes = {
  children: React.PropTypes.node,
};
