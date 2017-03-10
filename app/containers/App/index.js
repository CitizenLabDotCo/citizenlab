/**
 *
 * App.react.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React from 'react';
import { connect } from 'react-redux';
import { loadCurrentTenant } from './actions';

export class App extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    children: React.PropTypes.node,
    dispatch: React.PropTypes.func,
  };

  componentDidMount() {
    // TODO: remove hardcoded address
    fetch('http://localhost:4000/api/v1/tenants/current')
      .then((res) => res.json())
      .then((json) => {
        this.props.dispatch(loadCurrentTenant(json.data.attributes));
      });
  }

  render() {
    return (
      <div>
        {React.Children.toArray(this.props.children)}
      </div>
    );
  }
}

export default connect()(App);
