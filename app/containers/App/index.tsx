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
import { authUserStream, signOut } from 'services/auth';
import { currentTenantStream, ITenant } from 'services/tenant';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled, { ThemeProvider } from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// legacy redux stuff
import { store } from 'app';
import { LOAD_CURRENT_TENANT_SUCCESS } from 'utils/tenant/constants';
import { LOAD_CURRENT_USER_SUCCESS, DELETE_CURRENT_USER_LOCAL } from 'utils/auth/constants';

// typings
import { Location } from 'history';

const Container = styled.div`
  background: #fff;
  display: flex;
  flex-direction: column;
  height: 100vh;
  margin: 0;
  overflow: hidden;
  padding: 0;
  width: 100vw;
`;

const Content = styled.div`
  flex: 0 1 calc(100vh - ${(props) => props.theme.menuHeight}px);
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;

  ${media.smallerThanMaxTablet`
    flex-basis: calc(100vh - ${(props) => props.theme.menuHeight}px - ${(props) => props.theme.mobileMenuHeight});
  `}
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
  modalOpened: boolean;
  modalType: string | null;
  modalId: string | null;
  modalUrl: string | null;
};

export default class App extends React.PureComponent<Props & RouterState, State> {
  subscriptions: Rx.Subscription[];
  unlisten: Function;

  constructor(props) {
    super(props);
    this.state = {
      location: browserHistory.getCurrentLocation(),
      currentTenant: null,
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

    this.unlisten = browserHistory.listen((location) => {
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
      ).subscribe(([_authUser, _locale, currentTenant]) => {
        this.setState({ currentTenant });
      }),

      eventEmitter.observeEvent<IModalInfo>('cardClick').subscribe(({ eventValue }) => {
        const { type, id, url } = eventValue;
        this.openModal(type, id, url);
      }),
    ];
  }

  componentWillUnmount() {
    this.unlisten();
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
            <Container className={`${isAdminPage && 'admin'}`}>
              <Meta />

              <FullscreenModal
                opened={modalOpened}
                close={this.closeModal}
                url={modalUrl}
                headerChild={fullscreenModalHeaderChild}
              >
                <IdeasShow ideaId={modalId} inModal={true} />
              </FullscreenModal>

              <Navbar />

              <HasPermission item={{ type: 'route', path: location.pathname }} action="access">
                <Content>
                  {children}
                </Content>
                <HasPermission.No>
                  <ForbiddenRoute />
                </HasPermission.No>
              </HasPermission>
            </Container>
          </ThemeProvider>
        )}
      </>
    );
  }
}
