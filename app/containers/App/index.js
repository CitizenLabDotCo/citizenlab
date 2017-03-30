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
import { createStructuredSelector } from 'reselect';
import { makeSelectCurrentTenant } from 'persistedData';
// import { makeSelectCurrentUser } from 'utils/auth/selectors';
import { Row, Column } from 'components/Foundation/src/components/grid';
import Navbar from './Navbar';
import { loadCurrentTenant } from './actions';

class App extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

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
        <Navbar
          currentUser={this.props.currentUser}
          currentTenant={this.props.currentTenant}
        >
        </Navbar>
        <Row>
          <Column large={12}>
            {React.Children.toArray(this.props.children)}
          </Column>
        </Row>
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.node,
  dispatch: React.PropTypes.func,
  currentUser: React.PropTypes.object,
  currentTenant: React.PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  // currentUser: makeSelectCurrentUser(),
  currentTenant: makeSelectCurrentTenant(),
});

export default connect(mapStateToProps)(App);
