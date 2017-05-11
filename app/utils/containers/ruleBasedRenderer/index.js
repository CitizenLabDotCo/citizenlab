import React from 'react';
import PropTypes from 'prop-types';

const createRuledComponent = ({ check = () => true }) => ({ base, resource, children }) => {
  const isAutorized = check(base, resource);
  const elements = React.Children.toArray(children);
  const onValidElement = elements[0];
  if (isAutorized) return onValidElement;
  if (elements[1]) return elements[1];
  return null;
};

class RuleBasedRenderer extends React.Component {
  constructor(props) {
    super();
    const { action } = props;
    const rules = props.authorizations;
    const rule = (action && action.reduce((a, b) => a[b], rules)) || {};
    this.authorized = React.createElement(createRuledComponent(rule), props);
  }

  render() {
    return this.authorized;
  }
}

RuleBasedRenderer.propTypes = {
  action: PropTypes.array,
  authorizations: PropTypes.any,
};

export default RuleBasedRenderer;
