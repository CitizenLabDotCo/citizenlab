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
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { Saga } from 'react-redux-saga';
import { Container } from 'semantic-ui-react';
import { injectIntl, intlShape } from 'react-intl';

// import { DockableSagaView } from 'redux-saga-devtools';
// import { sagamonitor } from 'store';

import { makeSelectCurrentTenant } from 'utils/tenant/selectors';
import { loadCurrentUserRequest } from 'utils/auth/actions';
import { loadCurrentTenantRequest } from 'utils/tenant/actions';

import WatchSagas from 'containers/WatchSagas';

import authSagas from 'utils/auth/sagas';
import tenantSaga from 'utils/tenant/sagas';

import Navbar from './Navbar';

import messages from './messages';

class App extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentDidMount() {
    this.props.dispatch(loadCurrentTenantRequest());
    this.props.dispatch(loadCurrentUserRequest());
  }

  content() {
    const { currentTenant } = this.props;
    const { formatMessage } = this.props.intl;

    if (currentTenant) {
      return (
        <div>
          <Helmet
            title={formatMessage(messages.helmetTitle)}
            meta={[
              { name: 'description', content: formatMessage(messages.helmetDescription, { tenantName: currentTenant.attributes.name }) },
            ]}
          />
          <Navbar currentTenant={currentTenant} />
          <Container>
            <div>
              {this.props.children}
            </div>
          </Container>
          {/* <DockableSagaView monitor={sagamonitor}  /> */}
        </div>
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
  children: PropTypes.node,
  dispatch: PropTypes.func,
  currentTenant: PropTypes.object,
  intl: intlShape.isRequired,
};

const mapStateToProps = createStructuredSelector({
  currentTenant: makeSelectCurrentTenant(),
});

export default injectIntl(connect(mapStateToProps)(App));
