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
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from 'react-intl';
import { injectTFunc } from 'utils/containers/t/utils';
// import { DockableSagaView } from 'redux-saga-devtools';
// import { sagamonitor } from 'store';

// components
// import { Container } from 'semantic-ui-react';
import Navbar from './Navbar';
import messages from './messages';
import Loader from 'components/loaders';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import styled, { ThemeProvider } from 'styled-components';
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
  padding-top: 65px;
  background-color: #f2f2f2;
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
    const { tFunc, currentTenant, location, children, loadUser, colorMain, colorMenuBg, metaTitle, metaDescription } = this.props;
    const { formatMessage } = this.props.intl;

    const finalMetaDescription =
      (metaTitle && !metaDescription.isEmpty() && tFunc(metaDescription)) ||
      formatMessage(messages.helmetDescription, { tenantName: currentTenant.attributes.name });

    const finalMetaTitle =
      (metaTitle && !metaTitle.isEmpty() && tFunc(metaTitle)) ||
      formatMessage(messages.helmetTitle, { tenantName: currentTenant.attributes.name });


    const theme = {
      color: {
        main: colorMain || '#ef0071',
        menuBg: colorMenuBg || '#fff',
      },
    };

    return (
      <ThemeProvider theme={theme}>
        <Container>
          <Helmet>
            <title>{finalMetaTitle}</title>
            <meta name="description" content={finalMetaDescription} />
          </Helmet>

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
        {currentTenant ? this.content() : <div>Loading...</div>}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.node,
  currentTenant: PropTypes.object,
  intl: intlShape.isRequired,
  tFunc: PropTypes.func.isRequired,
  location: PropTypes.object,
  loadCurrentTenantRequest: PropTypes.func.isRequired,
  loadUser: PropTypes.func.isRequired,
  colorMain: PropTypes.string,
  colorMenuBg: PropTypes.string,
  metaTitle: PropTypes.object,
  metaDescription: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  currentTenant: makeSelectCurrentTenant(),
  colorMain: makeSelectSetting(['core', 'color_main']),
  colorMenuBg: makeSelectSetting(['core', 'color_menu_bg']),
  metaTitle: makeSelectSetting(['core', 'meta_title']),
  metaDescription: makeSelectSetting(['core', 'meta_description']),
});

const actions = {
  loadUser: loadCurrentUserRequest,
  loadCurrentTenantRequest,
};

export default injectTFunc(injectIntl(preprocess(mapStateToProps, actions)(App)));
