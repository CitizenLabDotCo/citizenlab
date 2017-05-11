import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { makeSelectCurrentUserImmutable } from 'utils/auth/selectors';
import authorizations from './authorizations';

const createAuthorized = ({ check = () => true }) => ({ user, resource, children }) => {
  const isAutorized = check(resource, user);
  const elements = React.Children.toArray(children);
  const onValidElement = elements[0];
  if (isAutorized) return onValidElement;
  if (elements[1]) return elements[1];
  return null;
};

class Authorize extends React.Component {
  constructor(props) {
    super();
    const { action } = props;
    const rules = authorizations || props.authorizations;
    const rule = (action && action.reduce((a, b) => a[b], rules)) || {};

    this.authorized = React.createElement(createAuthorized(rule), props);
  }

  render() {
    return this.authorized;
  }
}

Authorize.propTypes = {
  action: PropTypes.array,
  authorizations: PropTypes.any,
};

const mapStateToProps = () => createStructuredSelector({
  user: makeSelectCurrentUserImmutable(),
});

const AuthorizeComponent = connect(mapStateToProps)(Authorize);
export default AuthorizeComponent;
export const Else = AuthorizeComponent;
export { Authorize }
