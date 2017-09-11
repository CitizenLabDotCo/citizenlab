import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { RouterState } from 'react-router';

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
import { loadCurrentTenantSuccess } from 'utils/tenant/actions';

// sagas
import WatchSagas from 'containers/WatchSagas';
import authSagas from 'utils/auth/sagas';
import areasSagas from 'utils/areas/sagas';
import tenantSaga from 'utils/tenant/sagas';

// services
import { state, IStateStream } from 'services/state';
import { authUserStream, signOut } from 'services/auth';
import { currentTenantStream, ITenant } from 'services/tenant';

// legacy redux stuff 
import { store } from 'app';
import {  STORE_JWT, LOAD_CURRENT_USER_SUCCESS, DELETE_CURRENT_USER_LOCAL } from 'utils/auth/constants';

const Container = styled.div`
  margin-top: ${props => props.theme.menuHeight}px;

  ${media.phone`
    margin-bottom: ${props => props.theme.mobileMenuHeight}px;
  `}
`;

type Props = {};

type State = {
  currentTenant: ITenant | null;
};

export const namespace = 'App/index';

export default class App extends React.PureComponent<Props & RouterState, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    const initialState: State = { currentTenant: null };
    this.state$ = state.createStream<State>(namespace, namespace, initialState);
  }

  componentWillMount() {
    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),

      authUserStream().observable.subscribe((authUser) => {
        if (!authUser) {
          signOut();
          store.dispatch({ type: DELETE_CURRENT_USER_LOCAL });
        } else {
          store.dispatch({ type: LOAD_CURRENT_USER_SUCCESS, payload: authUser });
        }
      }),

      currentTenantStream().observable.subscribe((currentTenant) => {
        this.state$.next({ currentTenant });
        store.dispatch(loadCurrentTenantSuccess(currentTenant));
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { location, children } = this.props;
    const { currentTenant } = this.state;
    const theme = {
      colorMain: (currentTenant ? currentTenant.data.attributes.settings.core.color_main : '#ef0071'),
      menuStyle: 'light',
      menuHeight: 80,
      mobileMenuHeight: 80,
      maxPageWidth: 950,
    };

    return (
      <div>
        <WatchSagas sagas={authSagas} />
        <WatchSagas sagas={areasSagas} />
        <WatchSagas sagas={{ tenantSaga }} />

        {currentTenant && (
          <ThemeProvider theme={theme}>
            <Container>
              <Meta tenant={currentTenant} />

              <Navbar />

              <Authorize action={['routes', 'admin']} resource={location.pathname}>
                <div>
                  {children}
                </div>
                <Else>
                  <ForbiddenRoute />
                </Else>
              </Authorize>
            </Container>
          </ThemeProvider>
        )}
      </div>
    );
  }
}
