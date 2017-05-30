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
class RuleBasedRenderer extends React.Component {
  constructor(props) {
    super();
    const { action } = props;
    const rules = props.authorizations;
    this.rule = (action && action.reduce((a, b) => a[b], rules)) || {};
    const authorized = checkIfAutorized(this.rule, props);
    this.state = { authorized };
    this.authorizedComponent = getRuledComponent(authorized, props);
  }

  componentWillReceiveProps(nextProps) {
    this.authorized = checkIfAutorized(this.rule, nextProps);
    this.authorizedComponent = getRuledComponent(this.authorized, nextProps);

    if (this.authorized !== this.state.authorized) {
      this.setState({ authorized: this.authorized });
    }
  }

  shouldComponentUpdate(nextProps) {
    const nextChildren = nextProps;
    const children = this.props;
    return this.authorized !== this.state.authorized || nextChildren !== children;
  }

  render() {
    return this.authorizedComponent;
  }
}

RuleBasedRenderer.propTypes = {
  action: PropTypes.array,
  authorizations: PropTypes.object.isRequired,
};

export default RuleBasedRenderer;
