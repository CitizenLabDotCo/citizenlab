import React, { PureComponent, Suspense, lazy } from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { isString, isObject, uniq } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import 'moment-timezone';
import { configureScope } from '@sentry/browser';
import WebFont from 'webfontloader';

const localesMomentPairs = require('containers/App/constants.js').appLocalesMomentPairs;

// context
import { PreviousPathnameContext } from 'context';

// libraries
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';

// analytics
import ConsentManager from 'components/ConsentManager';
import { trackPage } from 'utils/analytics';

// components
import Meta from './Meta';
import Navbar from 'containers/Navbar';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import LoadableModal from 'components/Loadable/Modal';
import UserDeletedModalContent from 'components/UserDeletedModalContent';

// auth
import HasPermission from 'components/HasPermission';

// services
import { localeStream } from 'services/locale';
import { IUser } from 'services/users';
import { authUserStream, signOut, signOutAndDeleteAccountPart2 } from 'services/auth';
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
  userDeletedModalOpened: boolean;
  userActuallyDeleted: boolean;
};

const IdeaPageFullscreenModal = lazy(() => import('./IdeaPageFullscreenModal'));

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
      visible: true,
      userDeletedModalOpened: false,
      userActuallyDeleted: false
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
            configureScope((scope) => {
              scope.setUser({
                id: authUser.data.id,
              });
            });
          }
        })),
        locale$,
        tenant$.pipe(tap((tenant) => {
          uniq(tenant.data.attributes.settings.core.locales.filter(locale => locale !== 'en', 'ach').map(locale => localesMomentPairs[locale])).forEach(locale => require(`moment/locale/${locale}.js`));
          moment.tz.setDefault(tenant.data.attributes.settings.core.timezone);
        }))
      ).subscribe(([authUser, locale, tenant]) => {
        const momenLoc = localesMomentPairs[locale] || 'en';
        moment.locale(momenLoc);
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

      eventEmitter.observeEvent<IModalInfo>('ideaCardClick').subscribe(({ eventValue }) => {
        const { type, id, url } = eventValue;
        this.openModal(type, id, url);
      }),
    ];
    this.subscriptions.push(
      eventEmitter.observeEvent('tryAndDeleteProfile').subscribe(() => {
        signOutAndDeleteAccountPart2().then(success => {
          if (success) {
            this.setState({ userDeletedModalOpened: true, userActuallyDeleted: true });
          } else {
            this.setState({ userDeletedModalOpened: true, userActuallyDeleted: false });
          }
        });
      })
    );
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

  closeUserDeletedModal = () => {
    this.setState({ userDeletedModalOpened: false });
  }

  render() {
    const { location, children } = this.props;
    const {
      previousPathname,
      tenant,
      modalOpened,
      modalType,
      modalId,
      modalUrl,
      visible ,
      userDeletedModalOpened,
      userActuallyDeleted
    } = this.state;
    const isAdminPage = (location.pathname.startsWith('/admin'));
    const theme = getTheme(tenant);

    return (
      <>
        {tenant && visible && (
          <PreviousPathnameContext.Provider value={previousPathname}>
            <ThemeProvider theme={theme}>
              <Container className={`${isAdminPage ? 'admin' : 'citizen'}`}>
                <Meta />

                <ErrorBoundary>
                  <Suspense fallback={null}>
                    <IdeaPageFullscreenModal
                      modalOpened={modalOpened}
                      close={this.closeModal}
                      modalUrl={modalUrl}
                      modalId={modalId}
                      modalType={modalType}
                      unauthenticatedVoteClick={this.unauthenticatedVoteClick}
                    />
                  </Suspense>
                </ErrorBoundary>

                <ErrorBoundary>
                  <LoadableModal
                    opened={userDeletedModalOpened}
                    close={this.closeUserDeletedModal}
                  >
                    <UserDeletedModalContent userActuallyDeleted={userActuallyDeleted} />
                  </LoadableModal>
                </ErrorBoundary>

                <ErrorBoundary>
                  <div id="modal-portal" />
                </ErrorBoundary>

                <ErrorBoundary>
                  <Navbar fullscreenModalOpened={modalOpened} />
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
