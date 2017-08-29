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
import PropTypes from 'prop-types';

// import { DockableSagaView } from 'redux-saga-devtools';
// import { sagamonitor } from 'store';

// components
// import { Container } from 'semantic-ui-react';
import Meta from './Meta';
import Navbar from 'containers/Navbar';
import messages from './messages';
import Loader from 'components/loaders';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import styled, { ThemeProvider } from 'styled-components';
import { media } from 'utils/styleUtils';
// components - authorizations
import Authorize, { Else } from 'utils/containers/authorize';

// components - sagas
import WatchSagas from 'containers/WatchSagas';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import authSagas from 'utils/auth/sagas';
import areasSagas from 'utils/areas/sagas';
import tenantSaga from 'utils/tenant/sagas';
import voteControlSagas from 'components/VoteControl/sagas';
import { makeSelectCurrentTenant, makeSelectSetting } from 'utils/tenant/selectors';

import { loadCurrentUserRequest } from 'utils/auth/actions';
import { LOAD_CURRENT_USER_REQUEST } from 'utils/auth/constants';
import { loadCurrentTenantRequest } from 'utils/tenant/actions';

const Container = styled.div`
  margin-top: ${(props) => props.theme.menuHeight}px;

  ${media.phone`
    margin-bottom: ${(props) => props.theme.mobileMenuHeight}px;
  `}
`;

class App extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();
    this.key = 0;
  }

  componentDidMount() {
    this.props.loadCurrentTenantRequest();
  }

  content() {
    const { currentTenant, location, children, loadUser, colorMain, menuStyle } = this.props;


    const theme = {
      colorMain: colorMain || '#ef0071',
      menuStyle: menuStyle || 'light',
      menuHeight: 80,
      mobileMenuHeight: 80,
      maxPageWidth: 950,
    };

    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Meta tenant={currentTenant} metaTitle={this.props.metaTitle} metaDescription={this.props.metaDescription} />
          <Navbar currentTenant={currentTenant} location={this.props.location.pathname} />
          <Loader
            resourceLoader={loadUser}
            loadingMessage={messages.currentUserLoadingMessage}
            errorMessage={messages.currentUserLoadingError}
            listenenTo={LOAD_CURRENT_USER_REQUEST}
            withError={false}
          >
            <Authorize action={['routes', 'admin']} resource={location.pathname}>
              <div>
                {children}
              </div>
              <Else>
                <ForbiddenRoute />
              </Else>
            </Authorize>
          </Loader>
        </Container>
      </ThemeProvider>
    );
  }

  render() {
    const { currentTenant } = this.props;
    return (
      <div>
        <WatchSagas sagas={authSagas} />
        <WatchSagas sagas={areasSagas} />
        <WatchSagas sagas={{ tenantSaga }} />
        <WatchSagas sagas={voteControlSagas} />
        {currentTenant && this.content()}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
  currentTenant: PropTypes.object,
  location: PropTypes.object,
  loadCurrentTenantRequest: PropTypes.func.isRequired,
  loadUser: PropTypes.func.isRequired,
  colorMain: PropTypes.string,
  menuStyle: PropTypes.string,
  metaTitle: PropTypes.object,
  metaDescription: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  currentTenant: makeSelectCurrentTenant(),
  colorMain: makeSelectSetting(['core', 'color_main']),
  menuStyle: makeSelectSetting(['core', 'menu_style']),
  metaTitle: makeSelectSetting(['core', 'meta_title']),
  metaDescription: makeSelectSetting(['core', 'meta_description']),
});

const actions = {
  loadUser: loadCurrentUserRequest,
  loadCurrentTenantRequest,
};

export default preprocess(mapStateToProps, actions)(App);
