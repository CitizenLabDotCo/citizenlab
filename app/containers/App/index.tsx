import * as React from 'react';

// language
import { injectTFunc } from 'utils/containers/t/utils';
import { injectIntl } from 'react-intl';

// components
import Meta from './Meta';
import Navbar from 'containers/Navbar';
import messages from './messages';
import Loader from 'components/loaders';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import styled, { ThemeProvider } from 'styled-components';
import { media } from 'utils/styleUtils';

// authorizations
import Authorize, { Else } from 'utils/containers/authorize';
import { loadCurrentUserRequest } from 'utils/auth/actions';
import { LOAD_CURRENT_USER_REQUEST } from 'utils/auth/constants';
import { loadCurrentTenantRequest } from 'utils/tenant/actions';

// sagas
import WatchSagas from 'containers/WatchSagas';

// store
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import authSagas from 'utils/auth/sagas';
import areasSagas from 'utils/areas/sagas';
import tenantSaga from 'utils/tenant/sagas';
import { makeSelectCurrentTenant, makeSelectSetting } from 'utils/tenant/selectors';

// services
import { ITenantData } from 'services/tenant';

const Container = styled.div`
  margin-top: ${(props) => props.theme.menuHeight}px;

  ${media.phone`
    margin-bottom: ${(props) => props.theme.mobileMenuHeight}px;
  `}
`;

type Props = {
  children?: any;
  tFunc: (arg: { [key: string]: string }) => string;
  intl: ReactIntl.InjectedIntl;
  currentTenant: ITenantData;
  location: any;
  loadCurrentTenantRequest: () => void;
  loadUser: () => void;
  colorMain?: string;
  menuStyle?: string;
  metaTitle?: object;
  metaDescription?: object;
};

type State = {};

class App extends React.PureComponent<Props, State> {
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
          <Meta
            tenant={currentTenant}
            intl={this.props.intl}
            tFunc={this.props.tFunc}
          />

          <Navbar
            currentTenant={currentTenant}
            location={this.props.location.pathname}
          />

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
        {currentTenant && this.content()}
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  currentTenant: makeSelectCurrentTenant(),
  colorMain: makeSelectSetting(['core', 'color_main']),
  menuStyle: makeSelectSetting(['core', 'menu_style']),
  metaTitle: makeSelectSetting(['core', 'meta_title']),
  metaDescription: makeSelectSetting(['core', 'meta_description']),
});

const actions = {
  loadCurrentTenantRequest,
  loadUser: loadCurrentUserRequest
};

export default (injectIntl(injectTFunc(preprocess(mapStateToProps, actions)(App))) as any) as typeof App;
