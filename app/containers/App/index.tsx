import React, { PureComponent, Suspense, lazy } from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { isString, isObject, uniq, has } from 'lodash-es';
import { isNilOrError, isPage } from 'utils/helperUtils';
import { parse } from 'qs';
import moment from 'moment';
import 'moment-timezone';
import 'intersection-observer';
import { configureScope } from '@sentry/browser';
import GlobalStyle from 'global-styles';

// constants
import { appLocalesMomentPairs, ADMIN_TEMPLATES_GRAPHQL_PATH } from 'containers/App/constants';

// graphql
import { ApolloClient, ApolloLink, InMemoryCache, HttpLink } from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

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
import Footer from 'containers/Footer';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import LoadableModal from 'components/Loadable/Modal';
import LoadableUserDeleted from 'components/UserDeletedModalContent/LoadableUserDeleted';
import ErrorBoundary from 'components/ErrorBoundary';
import { LiveAnnouncer } from 'react-aria-live';
const VerificationModal = lazy(() => import('components/Verification/VerificationModal'));

// auth
import HasPermission from 'components/HasPermission';

// services
import { localeStream } from 'services/locale';
import { IUser } from 'services/users';
import { authUserStream, signOut, signOutAndDeleteAccountPart2 } from 'services/auth';
import { currentTenantStream, ITenant, ITenantStyle } from 'services/tenant';

// events
import eventEmitter from 'utils/eventEmitter';
import { openVerificationModal$, closeVerificationModal$ } from 'containers/App/verificationModalEvents';
import { getJwt } from 'utils/auth/jwt';

// style
import styled, { ThemeProvider } from 'styled-components';
import { media, getTheme } from 'utils/styleUtils';

// typings
import { TVerificationSteps, ContextShape } from 'components/Verification/VerificationSteps';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  background: #fff;
`;

const InnerContainer = styled.div`
  padding-top: ${props => props.theme.menuHeight}px;
  width: 100vw;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px);
  display: flex;
  flex-direction: column;
  align-items: stretch;

  ${media.smallerThanMaxTablet`
    padding-top: 0px;
    min-height: calc(100vh - ${props => props.theme.mobileMenuHeight}px - ${props => props.theme.mobileTopBarHeight}px);
  `}
`;

export interface IOpenPostPageModalEvent {
  id: string;
  slug: string;
  type: 'idea' | 'initiative';
}

type Props = {};

type State = {
  previousPathname: string | null;
  tenant: ITenant | null;
  authUser: IUser | null | undefined;
  modalId: string | null;
  modalSlug: string | null;
  modalType: 'idea' | 'initiative' | null;
  visible: boolean;
  userDeletedModalOpened: boolean;
  userActuallyDeleted: boolean;
  verificationModalOpened: boolean;
  verificationModalInitialStep: TVerificationSteps;
  verificationModalContext: ContextShape | null;
  navbarRef: HTMLElement | null;
  mobileNavbarRef: HTMLElement | null;
};

const PostPageFullscreenModal = lazy(() => import('./PostPageFullscreenModal'));

class App extends PureComponent<Props & WithRouterProps, State> {
  subscriptions: Subscription[];
  unlisten: Function;

  constructor(props) {
    super(props);
    this.state = {
      previousPathname: null,
      tenant: null,
      authUser: undefined,
      modalId: null,
      modalSlug: null,
      modalType: null,
      visible: true,
      userDeletedModalOpened: false,
      userActuallyDeleted: false,
      verificationModalOpened: false,
      verificationModalContext: null,
      verificationModalInitialStep: null,
      navbarRef: null,
      mobileNavbarRef: null
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

      this.setState((state) => ({
        previousPathname: !(previousPathname.endsWith('/sign-up') || previousPathname.endsWith('/sign-in')) ? previousPathname : state.previousPathname
      }));

      trackPage(newLocation.pathname);

      // If already created a user (step 1 of sign-up) and there's a required field in step 2,
      // redirect to complete-signup page
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
          moment.tz.setDefault(tenant.data.attributes.settings.core.timezone);

          uniq(tenant.data.attributes.settings.core.locales
            .filter(locale => locale !== 'en' && locale !== 'ach')
            .map(locale => appLocalesMomentPairs[locale]))
            .forEach(locale => require(`moment/locale/${locale}.js`));
        }))
      ).subscribe(([authUser, locale, tenant]) => {
        const momentLoc = appLocalesMomentPairs[locale] || 'en';
        moment.locale(momentLoc);
        this.setState({ tenant, authUser });
      }),

      tenant$.pipe(first()).subscribe((tenant) => {
        if (tenant.data.attributes.style && tenant.data.attributes.style.customFontAdobeId) {
          import('webfontloader').then((WebfontLoader) => {
            WebfontLoader.load({
              typekit: {
                id: (tenant.data.attributes.style as ITenantStyle).customFontAdobeId
              }
            });
          });
        }
      }),

      eventEmitter.observeEvent<IOpenPostPageModalEvent>('cardClick').subscribe(({ eventValue: { id, slug, type } }) => {
        this.openPostPageModal(id, slug, type);
      }),

      openVerificationModal$.subscribe(({ eventValue: { step, context } }) => {
        this.openVerificationModal(step, context);
      }),

      closeVerificationModal$.subscribe(() => {
        this.closeVerificationModal();
      }),

      eventEmitter.observeEvent('closeIdeaModal').subscribe(() => {
        this.closePostPageModal();
      }),

      eventEmitter.observeEvent('tryAndDeleteProfile').subscribe(() => {
        signOutAndDeleteAccountPart2().then(success => {
          if (success) {
            this.setState({ userDeletedModalOpened: true, userActuallyDeleted: true });
          } else {
            this.setState({ userDeletedModalOpened: true, userActuallyDeleted: false });
          }
        });
      })
    ];
  }

  componentWillUnmount() {
    this.unlisten();
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (prevState.authUser === undefined && !isNilOrError(this.state.authUser)) {
      const urlSearchParams = parse(this.props.location.search, { ignoreQueryPrefix: true });

      if (has(urlSearchParams, 'verification_success')) {
        window.history.replaceState(null, '', window.location.pathname);
        this.openVerificationModal('success', null);
      }

      if (has(urlSearchParams, 'verification_error') && urlSearchParams.verification_error === 'true') {
        window.history.replaceState(null, '', window.location.pathname);
        this.openVerificationModal('error', { error: this.props.location.query?.error || null } as ContextShape);
      }
    }
  }

  openPostPageModal = (id: string, slug: string, type: 'idea' | 'initiative') => {
    this.setState({
      modalId: id,
      modalSlug: slug,
      modalType: type
    });
  }

  closePostPageModal = () => {
    this.setState({
      modalId: null,
      modalSlug: null,
      modalType: null
    });
  }

  closeUserDeletedModal = () => {
    this.setState({ userDeletedModalOpened: false });
  }

  openVerificationModal = (step: TVerificationSteps, context: ContextShape | null) => {
    if (this.state.authUser) {
      this.setState({
        verificationModalOpened: true,
        verificationModalInitialStep: step,
        verificationModalContext: context
      });
    } else {
      console.log('verification modal not opened because user is not authenticated');
    }
  }

  closeVerificationModal = () => {
    this.setState({
      verificationModalOpened: false,
      verificationModalInitialStep: null,
      verificationModalContext: null
    });
  }

  setNavbarRef = (navbarRef: HTMLElement) => {
    this.setState({ navbarRef });
  }

  setMobileNavigationRef = (mobileNavbarRef: HTMLElement) => {
    this.setState({ mobileNavbarRef });
  }

  render() {
    const { location, children } = this.props;
    const {
      previousPathname,
      tenant,
      modalId,
      modalSlug,
      modalType,
      visible,
      userDeletedModalOpened,
      userActuallyDeleted,
      verificationModalOpened,
      verificationModalInitialStep,
      verificationModalContext,
      navbarRef,
      mobileNavbarRef
    } = this.state;
    const adminPage = isPage('admin', location.pathname);
    const initiativeFormPage = isPage('initiative_form', location.pathname);
    const ideaFormPage = isPage('idea_form', location.pathname);
    const ideaEditPage = isPage('idea_edit', location.pathname);
    const initiativeEditPage = isPage('initiative_edit', location.pathname);
    const signInPage = isPage('sign_in', location.pathname);
    const signUpPage = isPage('sign_up', location.pathname);
    const theme = getTheme(tenant);
    const showFooter = !adminPage &&
      !ideaFormPage &&
      !initiativeFormPage &&
      !ideaEditPage &&
      !initiativeEditPage;
    const showShortFeedback = !signInPage && !signUpPage;

    return (
      <>
        {tenant && visible && (
          <PreviousPathnameContext.Provider value={previousPathname}>
            <ThemeProvider theme={theme}>
              <LiveAnnouncer>
                <GlobalStyle />

                <Container>
                  <Meta />

                  <ErrorBoundary>
                    <Suspense fallback={null}>
                      <PostPageFullscreenModal
                        type={modalType}
                        postId={modalId}
                        slug={modalSlug}
                        close={this.closePostPageModal}
                        navbarRef={navbarRef}
                        mobileNavbarRef={mobileNavbarRef}
                      />
                    </Suspense>
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <LoadableModal
                      opened={userDeletedModalOpened}
                      close={this.closeUserDeletedModal}
                    >
                      <LoadableUserDeleted userActuallyDeleted={userActuallyDeleted} />
                    </LoadableModal>
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <Suspense fallback={null}>
                      <VerificationModal
                        opened={verificationModalOpened}
                        initialActiveStep={verificationModalInitialStep}
                        context={verificationModalContext}
                      />
                    </Suspense>
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <div id="modal-portal" />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <ConsentManager />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <Navbar setRef={this.setNavbarRef} setMobileNavigationRef={this.setMobileNavigationRef} />
                  </ErrorBoundary>

                  <InnerContainer>
                    <HasPermission item={{ type: 'route', path: location.pathname }} action="access">
                      <ErrorBoundary>
                        {children}
                      </ErrorBoundary>
                      <HasPermission.No>
                        <ForbiddenRoute />
                      </HasPermission.No>
                    </HasPermission>
                  </InnerContainer>

                  {showFooter && <Footer showShortFeedback={showShortFeedback} />}
                </Container>
                </LiveAnnouncer>
            </ThemeProvider>
          </PreviousPathnameContext.Provider>
        )}
      </>
    );
  }
}

const AppWithHoC = withRouter(App);

const cache = new InMemoryCache();

const httpLink = new HttpLink({ uri: ADMIN_TEMPLATES_GRAPHQL_PATH });

const authLink = new ApolloLink((operation, forward) => {
  const jwt = getJwt();

  operation.setContext({
    headers: {
      authorization: jwt ? `Bearer ${jwt}` : ''
    }
  });

  return forward(operation);
});

const client = new ApolloClient({
  cache,
  link: authLink.concat(httpLink)
});

export default (props: Props) => (
  <ApolloProvider client={client}>
    <AppWithHoC {...props} />
  </ApolloProvider>
);
