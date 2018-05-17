import React from 'react';
import { Subscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { tap } from 'rxjs/operators';
import get from 'lodash/get';
import * as moment from 'moment';
import 'moment-timezone';
import 'moment/locale/de';
import 'moment/locale/fr';
import 'moment/locale/nl';
import 'moment/locale/da';
import 'moment/locale/nb';
import find from 'lodash/find';
import { isNilOrError } from 'utils/helperUtils';

// context
import { PreviousPathnameContext } from 'context';

// libraries
import { RouterState, browserHistory } from 'react-router';

// analytics
import { trackPage, trackIdentification } from 'utils/analytics';

// components
import Meta from './Meta';
import Navbar from 'containers/Navbar';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import FullscreenModal from 'components/UI/FullscreenModal';
import IdeasShow from 'containers/IdeasShow';
import VoteControl from 'components/VoteControl';

// auth
import HasPermission from 'components/HasPermission';

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

// typings
import ErrorBoundary from 'components/ErrorBoundary';

const Container = styled.div`
  background: #fff;
  position: relative;
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
  previousPathname: string | null;
  tenant: ITenant | null;
  authUser: IUser | null;
  modalOpened: boolean;
  modalType: string | null;
  modalId: string | null;
  modalUrl: string | null;
  visible: boolean;
};

export default class App extends React.PureComponent<Props & RouterState, State> {
  subscriptions: Subscription[];
  unlisten: Function;

  constructor(props) {
    super(props);
    this.state = {
      previousPathname: null,
      tenant: null,
      authUser: null,
      modalOpened: false,
      modalType: null,
      modalId: null,
      modalUrl: null,
      visible: true
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const authUser$ = authUserStream().observable;
    const locale$ = localeStream().observable;
    const tenant$ = currentTenantStream().observable;

    this.unlisten = browserHistory.listenBefore((newLocation) => {
      const { authUser } = this.state;
      const previousLocation = browserHistory.getCurrentLocation();
      const previousPathname = get(previousLocation, 'pathname', null);
      this.setState({ previousPathname });

      trackPage(newLocation.pathname);

      if (newLocation
          && newLocation.pathname !== '/complete-signup'
          && authUser
          && authUser.data.attributes.registration_completed_at === null
      ) {
        // redirect to second signup step
        browserHistory.replace('/complete-signup');
      }
    });

    this.subscriptions = [
      combineLatest(
        authUser$.pipe(tap((authUser) => {
          if (isNilOrError(authUser)) {
            signOut();
          } else {
            trackIdentification(authUser.data.id, {
              email: authUser.data.attributes.email,
              firstName: authUser.data.attributes.first_name,
              lastName: authUser.data.attributes.last_name,
              createdAt: authUser.data.attributes.created_at,
              avatar: authUser.data.attributes.avatar.large,
              birthday: authUser.data.attributes.birthyear,
              gender: authUser.data.attributes.gender,
              locale: authUser.data.attributes.locale,
              isAdmin: !!find(authUser.data.attributes.roles, { type: 'admin' })
            });
          }
        })),
        locale$.pipe(tap((locale) => {
          moment.locale(locale);
        })),
        tenant$.pipe(tap((tenant) => {
          moment.tz.setDefault(tenant.data.attributes.settings.core.timezone);
        }))
      ).subscribe(([authUser, _locale, tenant]) => {
        this.setState({ tenant, authUser });
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
    const { previousPathname, tenant, modalOpened, modalType, modalId, modalUrl, visible } = this.state;
    const isAdminPage = (location.pathname.startsWith('/admin'));
    const theme = {
      colors,
      fontSizes,
      colorMain: (tenant ? tenant.data.attributes.settings.core.color_main : '#ef0071'),
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
        {tenant && visible && (
          <PreviousPathnameContext.Provider value={previousPathname}>
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
          </PreviousPathnameContext.Provider>
        )}
      </>
    );
  }
}
