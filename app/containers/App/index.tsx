import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import 'moment-timezone';

// libraries
import { RouterState, browserHistory } from 'react-router';

// components
import Meta from './Meta';
import Navbar from 'containers/Navbar';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import FullscreenModal from 'components/UI/FullscreenModal';
import IdeasShow from 'containers/IdeasShow';
import VoteControl from 'components/VoteControl';

// auth
import HasPermission from 'components/HasPermission';

// sagas
import WatchSagas from 'containers/WatchSagas';
import authSagas from 'utils/auth/sagas';
import areasSagas from 'utils/areas/sagas';
import tenantSaga from 'utils/tenant/sagas';

// services
import { localeStream } from 'services/locale';
import { IUser } from 'services/users';
import { authUserStream, signOut } from 'services/auth';
import { currentTenantStream, ITenant } from 'services/tenant';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled, { ThemeProvider } from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

// legacy redux stuff
import { store } from 'app';
import { LOAD_CURRENT_TENANT_SUCCESS } from 'utils/tenant/constants';
import { LOAD_CURRENT_USER_SUCCESS, DELETE_CURRENT_USER_LOCAL } from 'utils/auth/constants';

// typings
import { Location } from 'history';
import ErrorBoundary from 'components/ErrorBoundary';

const Container = styled.div`
  background: #fff;
`;

const InnerContainer = styled.div`
  padding-top: ${props => props.theme.menuHeight}px;

  &.citizen {
    ${media.smallerThanMaxTablet`
      padding-top: 0px;
      padding-bottom: ${props => props.theme.mobileMenuHeight}px;
    `}
  }
`;

export interface IModalInfo {
  type: string;
  id: string | null;
  url: string | null;
}

type Props = {};

type State = {
  location: Location;
  currentTenant: ITenant | null;
  authUser: IUser | null;
  modalOpened: boolean;
  modalType: string | null;
  modalId: string | null;
  modalUrl: string | null;
};

export default class App extends React.PureComponent<Props & RouterState, State> {
  subscriptions: Rx.Subscription[];
  unlisten1: Function;
  unlisten2: Function;

  constructor(props) {
    super(props);
    this.state = {
      location: browserHistory.getCurrentLocation(),
      currentTenant: null,
      authUser: null,
      modalOpened: false,
      modalType: null,
      modalId: null,
      modalUrl: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.unlisten1 = browserHistory.listenBefore((location) => {
      const { authUser } = this.state;

      if (location
          && location.pathname !== '/complete-signup'
          && authUser
          && authUser.data.attributes.registration_completed_at === null
      ) {
        // redirect to second signup step
        browserHistory.replace('/complete-signup');
      }
    });

    this.unlisten2 = browserHistory.listen((location) => {
      this.setState({ location });
    });

    this.subscriptions = [
      Rx.Observable.combineLatest(
        authUser$.do((authUser) => {
          if (!authUser) {
            signOut();
            store.dispatch({ type: DELETE_CURRENT_USER_LOCAL });
          } else {
            store.dispatch({ type: LOAD_CURRENT_USER_SUCCESS, payload: authUser });
          }
        }),
        locale$.do((locale) => {
          moment.locale(locale);
        }),
        currentTenant$.do((currentTenant) => {
          moment.tz.setDefault(currentTenant.data.attributes.settings.core.timezone);
          store.dispatch({ type: LOAD_CURRENT_TENANT_SUCCESS, payload: currentTenant });
        })
      ).subscribe(([authUser, _locale, currentTenant]) => {
        this.setState({ currentTenant, authUser });
      }),

      eventEmitter.observeEvent<IModalInfo>('cardClick').subscribe(({ eventValue }) => {
        const { type, id, url } = eventValue;
        this.openModal(type, id, url);
      }),
    ];
  }

  componentWillUnmount() {
    this.unlisten1();
    this.unlisten2();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openModal = (type: string, id: string | null, url: string | null) => {
    this.setState({ modalOpened: true, modalType: type, modalId: id, modalUrl: url });
  }

  closeModal = () => {
    this.setState({ modalOpened: false, modalType: null, modalId: null, modalUrl: null });
  }

  unauthenticatedVoteClick = () => {
    browserHistory.push('/sign-in');
  }

  render() {
    const { location, children } = this.props;
    const { currentTenant, modalOpened, modalType, modalId, modalUrl } = this.state;
    const isAdminPage = (location.pathname.startsWith('/admin'));
    const theme = {
      colors,
      fontSizes,
      colorMain: (currentTenant ? currentTenant.data.attributes.settings.core.color_main : '#ef0071'),
      menuStyle: 'light',
      menuHeight: 74,
      mobileMenuHeight: 72,
      mobileTopBarHeight: 66,
      maxPageWidth: 952,
    };

    const fullscreenModalHeaderChild: JSX.Element | undefined = ((modalOpened && modalType === 'idea' && modalId) ? (
      <VoteControl
        ideaId={modalId}
        unauthenticatedVoteClick={this.unauthenticatedVoteClick}
        size="1"
      />
    ) : undefined);

    return (
      <>
        <WatchSagas sagas={authSagas} />
        <WatchSagas sagas={areasSagas} />
        <WatchSagas sagas={{ tenantSaga }} />

        {currentTenant && (
          <ThemeProvider theme={theme}>
            <Container className={`${isAdminPage ? 'admin' : 'citizen'}`}>
              <Meta />

              <FullscreenModal
                opened={modalOpened}
                close={this.closeModal}
                url={modalUrl}
                headerChild={fullscreenModalHeaderChild}
              >
                <IdeasShow ideaId={modalId} inModal={true} />
              </FullscreenModal>

              <div id="modal-portal" />

              <Navbar />

              <InnerContainer className={`${isAdminPage ? 'admin' : 'citizen'}`}>
                <HasPermission item={{ type: 'route', path: location.pathname }} action="access">
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                  <HasPermission.No>
                    <ForbiddenRoute />
                  </HasPermission.No>
                </HasPermission>
              </InnerContainer>
            </Container>
          </ThemeProvider>
        )}
      </>
    );
  }
}
