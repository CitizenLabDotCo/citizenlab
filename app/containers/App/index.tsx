import React, { PureComponent } from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { isString, isObject } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import 'moment-timezone';
import 'moment/locale/en-gb';
import 'moment/locale/en-ca';
import 'moment/locale/nl';
import 'moment/locale/nl-be';
import 'moment/locale/fr';
import 'moment/locale/de';
import 'moment/locale/da';
import 'moment/locale/nb';
import * as Sentry from '@sentry/browser';
import WebFont from 'webfontloader';

// context
import { PreviousPathnameContext } from 'context';

// libraries
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// analytics
import ConsentManager from 'components/ConsentManager';
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
import styled, { ThemeProvider, injectGlobal } from 'styled-components';
import { media, getTheme } from 'utils/styleUtils';

// typings
import ErrorBoundary from 'components/ErrorBoundary';

const Container = styled.div`
  background: #fff;
  position: relative;
`;

const InnerContainer = styled.div`
  padding-top: ${props => props.theme.menuHeight}px;
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileTopBarHeight}px - 1px);
  `}

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

class App extends PureComponent<Props & WithRouterProps, State> {
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

    this.unlisten = clHistory.listenBefore((newLocation) => {
      const { authUser } = this.state;
      const previousPathname = location.pathname;
      const nextPathname = newLocation.pathname;
      const registrationCompletedAt = (authUser ? authUser.data.attributes.registration_completed_at : null);

      this.setState({ previousPathname });

      trackPage(newLocation.pathname);

      if (isObject(authUser) && !isString(registrationCompletedAt) && !nextPathname.replace(/\/$/, '').endsWith('complete-signup')) {
        clHistory.replace({
          pathname: '/complete-signup',
          search: newLocation.search
        });
      }
    });

    this.subscriptions = [
      combineLatest(
        authUser$.pipe(tap((authUser) => {
          if (isNilOrError(authUser)) {
            signOut();
          } else {
            Sentry.configureScope((scope) => {
              scope.setUser({
                id: authUser.data.id,
              });
            });
            trackIdentification(authUser);
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

      tenant$.pipe(first()).subscribe((tenant) => {
        if (tenant.data.attributes.style && tenant.data.attributes.style.customFontAdobeId) {
          WebFont.load({
            typekit: {
              id: tenant.data.attributes.style.customFontAdobeId
            },
            fontactive: (familyName, _fvd) => {
              injectGlobal`
                html, body, h1, h2, h3, h4, h5, button, input, optgroup, select, textarea {
                  font-family: ${familyName}, 'larsseit', 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
                }
              `;
            },
          });
        }
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
    clHistory.push('/sign-in');
  }

  render() {
    const { location, children } = this.props;
    const { previousPathname, tenant, modalOpened, modalType, modalId, modalUrl, visible } = this.state;
    const isAdminPage = (location.pathname.startsWith('/admin'));
    const theme = getTheme(tenant);

    const fullscreenModalHeaderChild = ((modalOpened && modalType === 'idea' && modalId) ? (
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
                <ErrorBoundary>
                  <FullscreenModal
                    opened={modalOpened}
                    close={this.closeModal}
                    url={modalUrl}
                    headerChild={fullscreenModalHeaderChild}
                  >
                    {modalId && <IdeasShow ideaId={modalId} inModal={true} />}
                  </FullscreenModal>
                </ErrorBoundary>

                <ErrorBoundary>
                  <div id="modal-portal" />
                </ErrorBoundary>

                <ErrorBoundary>
                  <Navbar />
                </ErrorBoundary>
                <ErrorBoundary>
                  <ConsentManager />
                </ErrorBoundary>

                <InnerContainer role="main" className={`${isAdminPage ? 'admin' : 'citizen'}`}>
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

export default withRouter(App);
