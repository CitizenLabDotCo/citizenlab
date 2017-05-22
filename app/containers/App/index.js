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
import { Container } from 'semantic-ui-react';

import { DockableSagaView } from 'redux-saga-devtools';
import { sagamonitor } from 'store';

import { makeSelectCurrentTenant } from 'utils/tenant/selectors';
import { loadCurrentUserRequest } from 'utils/auth/actions';
import { loadCurrentTenantRequest } from 'utils/tenant/actions';

import WatchSagas from 'containers/WatchSagas';

import authSagas from 'utils/auth/sagas';
import tenantSaga from 'utils/tenant/sagas';

import Navbar from './Navbar';

class App extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentDidMount() {
    this.props.dispatch(loadCurrentTenantRequest());
    this.props.dispatch(loadCurrentUserRequest());
  }

  content() {
    const { currentTenant } = this.props;
    if (currentTenant) {
      return (
        <div>
          <Navbar currentTenant={currentTenant} />
          <Container>
            <div>
              {React.Children.toArray(this.props.children)}
            </div>
          </Container>
{/*          <DockableSagaView monitor={sagamonitor}  />
*/}        </div>
      );
    } else { // eslint-disable-line no-else-return
      return <div>Loading...</div>;
    }
  }

  render() {
    return (
      <div>
        <WatchSagas sagas={authSagas} />
        <Saga saga={tenantSaga} />
        {this.content()}
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.node,
  dispatch: React.PropTypes.func,
  currentTenant: React.PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  currentTenant: makeSelectCurrentTenant(),
});

export default connect(mapStateToProps)(App);
