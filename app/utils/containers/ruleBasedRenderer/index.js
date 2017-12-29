import React from 'react';
import PropTypes from 'prop-types';


// this function returns one of the two children of the components according if the check returns true or false

const checkIfAutorized = ({ check = () => true }, { base, resource }) => check(base, resource);

const getRuledComponent = (isAutorized, { children }) => {
  const elements = React.Children.toArray(children);
  const onValidElement = elements[0];
  if (isAutorized) return onValidElement;
  if (elements[1]) return elements[1];
  return null;
};

// here we mostly select the specific authorization check we want to use
class RuleBasedRenderer extends React.PureComponent {
  constructor(props) {
    super();
    const { action } = props;
    const rules = props.authorizations;
    this.rule = (action && action.reduce((a, b) => a[b], rules)) || {};
  }

  render() {
    const authorized = checkIfAutorized(this.rule, this.props);
    const authorizedComponent = getRuledComponent(authorized, this.props);

    return authorizedComponent;
  }
}

RuleBasedRenderer.propTypes = {
  action: PropTypes.array,
  authorizations: PropTypes.object.isRequired,
};

export default RuleBasedRenderer;
