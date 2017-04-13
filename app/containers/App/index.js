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
import { Saga } from 'react-redux-saga';
import { makeSelectCurrentUser } from 'utils/auth/selectors';
import { makeSelectCurrentTenant } from 'utils/tenant/selectors';
import { loadCurrentUserRequest } from 'utils/auth/actions';
import { loadCurrentTenantRequest } from 'utils/tenant/actions';
import authSaga from 'utils/auth/sagas';
import tenantSaga from 'utils/tenant/sagas';
import { Container } from 'semantic-ui-react';
// import 'semantic-ui-css/components/reset.css';
// import 'semantic-ui-css/components/card.css';
// import 'semantic-ui-css/components/image.css';
// import 'semantic-ui-css/components/button.css';
// import 'semantic-ui-css/components/icon.css';
// import 'semantic-ui-css/components/label.css';
// import 'semantic-ui-css/components/menu.css';
// import 'semantic-ui-css/components/input.css';
// import 'semantic-ui-css/components/dropdown.css';
// import 'semantic-ui-css/components/grid.css';
// import 'semantic-ui-css/components/container.css';
// import 'semantic-ui-css/components/item.css';
// import 'semantic-ui-css/components/list.css';
// import 'semantic-ui-css/components/transition.css';
import 'semantic-ui-css/semantic.css';
import Navbar from './Navbar';

class App extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentDidMount() {
    this.props.dispatch(loadCurrentTenantRequest());
    this.props.dispatch(loadCurrentUserRequest());
  }

  content() {
    const { currentTenant, currentUser } = this.props;

    if (currentTenant) {
      return (
        <div>
          <Navbar
            currentUser={currentUser}
            currentTenant={currentTenant}
          >
          </Navbar>
          <Container>
            {React.Children.toArray(this.props.children)}
          </Container>
        </div>
      );
    } else { // eslint-disable-line no-else-return
      return <div>Loading...</div>;
    }
  }

  render() {
    return (
      <div>
        <Saga saga={authSaga} />
        <Saga saga={tenantSaga} />
        {this.content()}
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
  currentTenant: makeSelectCurrentTenant(),
  currentUser: makeSelectCurrentUser(),
});

export default connect(mapStateToProps)(App);
