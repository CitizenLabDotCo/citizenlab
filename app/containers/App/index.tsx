import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { RouterState } from 'react-router';

// components
import Meta from './Meta';
import Navbar from 'containers/Navbar';
import messages from './messages';
import Loader from 'components/loaders';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import Modal from 'components/UI/Modal';
import IdeasShow from 'containers/IdeasShow';
import { namespace as IdeaCardComponent } from 'components/IdeaCard';

// auth
import Authorize, { Else } from 'utils/containers/authorize';

// sagas
import WatchSagas from 'containers/WatchSagas';
import authSagas from 'utils/auth/sagas';
import areasSagas from 'utils/areas/sagas';
import tenantSaga from 'utils/tenant/sagas';

// services
import { authUserStream, signOut } from 'services/auth';
import { currentTenantStream, ITenant } from 'services/tenant';
import { topicsStream, ITopics, ITopicData } from 'services/topics';
import { projectsStream, IProjects, IProjectData } from 'services/projects';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled, { ThemeProvider } from 'styled-components';
import { media } from 'utils/styleUtils';

// legacy redux stuff 
import { store } from 'app';
import { LOAD_CURRENT_TENANT_SUCCESS } from 'utils/tenant/constants';
import { LOAD_CURRENT_USER_SUCCESS, DELETE_CURRENT_USER_LOCAL } from 'utils/auth/constants';

const Container = styled.div`
  margin: 0;
  padding: 0;
  padding-top: ${props => props.theme.menuHeight}px;

  ${media.phone`
    padding-bottom: ${props => props.theme.mobileMenuHeight}px;
  `}
`;

export interface IModalProps {
  ideaId: string;
  ideaSlug: string;
}

type Props = {};

type State = {
  currentTenant: ITenant | null;
  modal: IModalProps | null;
};

export default class App extends React.PureComponent<Props & RouterState, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      currentTenant: null,
      modal: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const authUser$ = authUserStream().observable;
    // const currentTenant$ = currentTenantStream().observable;
    // const topics$ = topicsStream().observable;
    // const projects$ = projectsStream().observable;

    this.subscriptions = [
      eventEmitter.observe<IModalProps>(IdeaCardComponent, 'cardClick').subscribe(({ eventValue }) => {
        const { ideaId, ideaSlug } = eventValue;
        this.openModal({ ideaId, ideaSlug });
      }),

      authUser$.switchMap((authUser) => {
        console.log('zolg');

        if (!authUser) {
          signOut();
          store.dispatch({ type: DELETE_CURRENT_USER_LOCAL });
        } else {
          store.dispatch({ type: LOAD_CURRENT_USER_SUCCESS, payload: authUser });
        }

        const currentTenant$ = currentTenantStream().observable;
        const topics$ = topicsStream().observable;
        const projects$ = projectsStream().observable;

        return Rx.Observable.combineLatest(
          topics$,
          projects$,
          currentTenant$.do((currentTenant) => {
            this.setState({ currentTenant });
            store.dispatch({ type: LOAD_CURRENT_TENANT_SUCCESS, payload: currentTenant });
          })
        );
      }).subscribe()

      /*
      authUser$.subscribe((authUser) => {
        if (!authUser) {
          signOut();
          store.dispatch({ type: DELETE_CURRENT_USER_LOCAL });
        } else {
          store.dispatch({ type: LOAD_CURRENT_USER_SUCCESS, payload: authUser });
        }
      }),

      currentTenant$.subscribe((currentTenant) => {
        this.setState({ currentTenant });
        store.dispatch({ type: LOAD_CURRENT_TENANT_SUCCESS, payload: currentTenant });
      }),

      // prefetch
      Rx.Observable.combineLatest(
        topics$,
        projects$
      ).subscribe()
      */
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  openModal = (modal: IModalProps) => {
    this.setState({ modal });
  }

  closeModal = () => {
    this.setState({ modal: null });
  }

  render() {
    const { location, children } = this.props;
    const { currentTenant, modal } = this.state;
    const modalOpened = !_.isNull(modal);
    const modalUrl = !_.isNull(modal) ? `/ideas/${modal.ideaSlug}` : undefined;
    const theme = {
      colorMain: (currentTenant ? currentTenant.data.attributes.settings.core.color_main : '#ef0071'),
      menuStyle: 'light',
      menuHeight: 74,
      mobileMenuHeight: 80,
      maxPageWidth: 952,
    };

    return (
      <div>
        <WatchSagas sagas={authSagas} />
        <WatchSagas sagas={areasSagas} />
        <WatchSagas sagas={{ tenantSaga }} />

        {currentTenant && (
          <ThemeProvider theme={theme}>
            <Container>
              <Meta />

              <Modal opened={modalOpened} close={this.closeModal} url={modalUrl}>
                {modal && <IdeasShow location={location} ideaId={modal.ideaId} />}
              </Modal>

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
