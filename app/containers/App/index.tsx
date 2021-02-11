import React, { PureComponent, Suspense, lazy } from 'react';
import { adopt } from 'react-adopt';
import { Subscription, combineLatest } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { uniq, has, includes } from 'lodash-es';
import { isNilOrError, isPage, endsWith } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import { parse } from 'qs';
import moment from 'moment';
import 'moment-timezone';
import 'intersection-observer';
import 'focus-visible';
import smoothscroll from 'smoothscroll-polyfill';
import { configureScope } from '@sentry/browser';
import GlobalStyle from 'global-styles';

// constants
import {
  appLocalesMomentPairs,
  ADMIN_TEMPLATES_GRAPHQL_PATH,
  locales,
} from 'containers/App/constants';

// graphql
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  HttpLink,
} from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

// context
import { PreviousPathnameContext } from 'context';

// signup/in
import { openSignUpInModal } from 'components/SignUpIn/events';

// verification
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// analytics
import ConsentManager from 'components/ConsentManager';
import { trackPage } from 'utils/analytics';

// components
import Meta from './Meta';
import Navbar from 'containers/Navbar';
import PlatformFooter from 'containers/PlatformFooter';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import LoadableModal from 'components/Loadable/Modal';
import LoadableUserDeleted from 'components/UserDeletedModalContent/LoadableUserDeleted';
import ErrorBoundary from 'components/ErrorBoundary';
import { LiveAnnouncer } from 'react-aria-live';
const VerificationModal = lazy(() =>
  import('components/Verification/VerificationModal')
);
const SignUpInModal = lazy(() => import('components/SignUpIn/SignUpInModal'));
const PostPageFullscreenModal = lazy(() => import('./PostPageFullscreenModal'));

// auth
import HasPermission from 'components/HasPermission';

// services
import { localeStream } from 'services/locale';
import { IUser } from 'services/users';
import {
  authUserStream,
  signOut,
  signOutAndDeleteAccountPart2,
} from 'services/auth';
import {
  currentAppConfigurationStream,
  IAppConfiguration,
  IAppConfigurationStyle,
} from 'services/tenant';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';

// events
import eventEmitter from 'utils/eventEmitter';
import { getJwt } from 'utils/auth/jwt';

// style
import styled, { ThemeProvider } from 'styled-components';
import { media, getTheme } from 'utils/styleUtils';

// typings
import { SSOParams } from 'services/singleSignOn';
import { Locale } from 'typings';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  background: #fff;
`;

const InnerContainer = styled.div`
  width: 100vw;
  padding-top: ${(props) => props.theme.menuHeight}px;
  min-height: calc(100vh - ${(props) => props.theme.menuHeight}px);
  display: flex;
  flex-direction: column;
  align-items: stretch;

  ${media.smallerThanMaxTablet`
    padding-top: ${(props) => props.theme.mobileTopBarHeight}px;
    min-height: calc(100vh - ${(props) =>
      props.theme.mobileTopBarHeight}px - ${(props) =>
    props.theme.mobileMenuHeight}px);
  `}
`;

export interface IOpenPostPageModalEvent {
  id: string;
  slug: string;
  type: 'idea' | 'initiative';
}

interface InputProps {}

interface DataProps {
  redirectsEnabled: GetFeatureFlagChildProps;
}

interface Props extends WithRouterProps, InputProps, DataProps {}

interface State {
  previousPathname: string | null;
  tenant: IAppConfiguration | null;
  authUser: IUser | null | undefined;
  modalId: string | null;
  modalSlug: string | null;
  modalType: 'idea' | 'initiative' | null;
  visible: boolean;
  userDeletedModalOpened: boolean;
  userActuallyDeleted: boolean;
  signUpInModalMounted: boolean;
  verificationModalMounted: boolean;
  navbarRef: HTMLElement | null;
  mobileNavbarRef: HTMLElement | null;
  locale: Locale | null;
}

class App extends PureComponent<Props, State> {
  subscriptions: Subscription[];
  unlisten: () => void;

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
      signUpInModalMounted: false,
      verificationModalMounted: false,
      navbarRef: null,
      mobileNavbarRef: null,
      locale: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { redirectsEnabled } = this.props;
    const authUser$ = authUserStream().observable;
    const locale$ = localeStream().observable;
    const tenant$ = currentAppConfigurationStream().observable;

    this.unlisten = clHistory.listenBefore((newLocation) => {
      const newPreviousPathname = location.pathname;
      const pathsToIgnore = [
        'sign-up',
        'sign-in',
        'complete-signup',
        'invite',
        'authentication-error',
      ];
      this.setState((state) => ({
        previousPathname: !endsWith(newPreviousPathname, pathsToIgnore)
          ? newPreviousPathname
          : state.previousPathname,
      }));
      if (redirectsEnabled) {
        this.handleCustomRedirect();
      }
      trackPage(newLocation.pathname);
    });

    trackPage(location.pathname);

    smoothscroll.polyfill();

    this.subscriptions = [
      combineLatest(
        authUser$.pipe(
          tap((authUser) => {
            if (isNilOrError(authUser)) {
              signOut();
            } else {
              configureScope((scope) => {
                scope.setUser({
                  id: authUser.data.id,
                });
              });
            }
          })
        ),
        locale$,
        tenant$.pipe(
          tap((tenant) => {
            moment.tz.setDefault(tenant.data.attributes.settings.core.timezone);

            uniq(
              tenant.data.attributes.settings.core.locales
                .filter((locale) => locale !== 'en' && locale !== 'ach')
                .map((locale) => appLocalesMomentPairs[locale])
            ).forEach((locale) => require(`moment/locale/${locale}.js`));
          })
        )
      ).subscribe(([authUser, locale, tenant]) => {
        const momentLoc = appLocalesMomentPairs[locale] || 'en';
        moment.locale(momentLoc);
        this.setState({ tenant, authUser, locale });
      }),

      tenant$.pipe(first()).subscribe((tenant) => {
        if (
          tenant.data.attributes.style &&
          tenant.data.attributes.style.customFontAdobeId
        ) {
          import('webfontloader').then((WebfontLoader) => {
            WebfontLoader.load({
              typekit: {
                id: (tenant.data.attributes.style as IAppConfigurationStyle)
                  .customFontAdobeId,
              },
            });
          });
        }
      }),

      eventEmitter
        .observeEvent<IOpenPostPageModalEvent>('cardClick')
        .subscribe(({ eventValue: { id, slug, type } }) => {
          this.openPostPageModal(id, slug, type);
        }),

      eventEmitter.observeEvent('closeIdeaModal').subscribe(() => {
        this.closePostPageModal();
      }),

      eventEmitter.observeEvent('tryAndDeleteProfile').subscribe(() => {
        signOutAndDeleteAccountPart2().then((success) => {
          if (success) {
            this.setState({
              userDeletedModalOpened: true,
              userActuallyDeleted: true,
            });
          } else {
            this.setState({
              userDeletedModalOpened: true,
              userActuallyDeleted: false,
            });
          }
        });
      }),
    ];
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const {
      authUser,
      tenant,
      signUpInModalMounted,
      verificationModalMounted,
    } = this.state;
    const { redirectsEnabled } = this.props;
    const { pathname, search } = this.props.location;
    const isAuthError = endsWith(pathname, 'authentication-error');
    const isInvitation = endsWith(pathname, '/invite');

    if (
      redirectsEnabled &&
      (prevState.tenant !== tenant ||
        prevProps.location.pathname !== this.props.location.pathname)
    ) {
      this.handleCustomRedirect();
    }

    if (
      (!prevState.signUpInModalMounted &&
        signUpInModalMounted &&
        isAuthError) ||
      (!prevState.signUpInModalMounted &&
        signUpInModalMounted &&
        isInvitation) ||
      (!prevState.signUpInModalMounted &&
        signUpInModalMounted &&
        !isNilOrError(authUser)) ||
      (prevState.authUser === undefined &&
        !isNilOrError(authUser) &&
        signUpInModalMounted)
    ) {
      const urlSearchParams = (parse(search, {
        ignoreQueryPrefix: true,
      }) as any) as SSOParams;
      const token = urlSearchParams?.['token'] as string | undefined;
      const shouldComplete = !authUser?.data?.attributes
        ?.registration_completed_at;

      // see services/singleSignOn.ts
      const {
        sso_response,
        sso_flow,
        sso_pathname,
        sso_verification,
        sso_verification_action,
        sso_verification_id,
        sso_verification_type,
      } = urlSearchParams;

      if (isAuthError || isInvitation) {
        window.history.replaceState(null, '', '/');
      }

      if (sso_response || shouldComplete || isInvitation) {
        const shouldVerify =
          !authUser?.data?.attributes?.verified && sso_verification;

        if (!isAuthError && sso_pathname) {
          clHistory.replace(sso_pathname);
        }

        if (
          !endsWith(sso_pathname, ['sign-up', 'sign-in']) &&
          (isAuthError ||
            (isInvitation && shouldComplete) ||
            shouldVerify ||
            shouldComplete)
        ) {
          openSignUpInModal({
            isInvitation,
            token,
            flow: isAuthError && sso_flow ? sso_flow : 'signup',
            error: isAuthError,
            verification: !!sso_verification,
            verificationContext: !!(
              sso_verification &&
              sso_verification_action &&
              sso_verification_id &&
              sso_verification_type
            )
              ? {
                  action: sso_verification_action as any,
                  id: sso_verification_id as any,
                  type: sso_verification_type as any,
                }
              : undefined,
          });
        }
      }
    }

    if (
      !isNilOrError(authUser) &&
      verificationModalMounted &&
      (prevState.authUser === undefined || !prevState.verificationModalMounted)
    ) {
      const urlSearchParams = parse(search, { ignoreQueryPrefix: true });

      if (has(urlSearchParams, 'verification_success')) {
        window.history.replaceState(null, '', window.location.pathname);
        openVerificationModal({ step: 'success' });
      }

      if (
        has(urlSearchParams, 'verification_error') &&
        urlSearchParams.verification_error === 'true'
      ) {
        window.history.replaceState(null, '', window.location.pathname);
        openVerificationModal({
          step: 'error',
          error: this.props.location.query?.error || null,
          context: null,
        });
      }
    }
  }

  componentWillUnmount() {
    this.unlisten();
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  handleCustomRedirect() {
    const {
      location: { pathname },
    } = this.props;
    const { tenant } = this.state;
    const urlSegments = pathname.replace(/^\/+/g, '').split('/');

    if (!isNilOrError(tenant) && tenant.data.attributes.settings.redirects) {
      const { rules } = tenant.data.attributes.settings.redirects;

      rules.forEach((rule) => {
        if (
          urlSegments.length === 2 &&
          includes(locales, urlSegments[0]) &&
          urlSegments[1] === rule.path
        ) {
          window.location.href = rule.target;
        }
      });
    }
  }

  openPostPageModal = (
    id: string,
    slug: string,
    type: 'idea' | 'initiative'
  ) => {
    this.setState({
      modalId: id,
      modalSlug: slug,
      modalType: type,
    });
  };

  closePostPageModal = () => {
    this.setState({
      modalId: null,
      modalSlug: null,
      modalType: null,
    });
  };

  closeUserDeletedModal = () => {
    this.setState({ userDeletedModalOpened: false });
  };

  setNavbarRef = (navbarRef: HTMLElement) => {
    this.setState({ navbarRef });
  };

  setMobileNavigationRef = (mobileNavbarRef: HTMLElement) => {
    this.setState({ mobileNavbarRef });
  };

  singUpInModalMounted = () => {
    this.setState({ signUpInModalMounted: true });
  };

  verificationModalMounted = () => {
    this.setState({ verificationModalMounted: true });
  };

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
      navbarRef,
      mobileNavbarRef,
    } = this.state;
    const isAdminPage = isPage('admin', location.pathname);
    const isInitiativeFormPage = isPage('initiative_form', location.pathname);
    const isIdeaFormPage = isPage('idea_form', location.pathname);
    const isIdeaEditPage = isPage('idea_edit', location.pathname);
    const isInitiativeEditPage = isPage('initiative_edit', location.pathname);
    const isSignInPage = isPage('sign_in', location.pathname);
    const isSignUpPage = isPage('sign_up', location.pathname);
    const theme = getTheme(tenant);
    const showFooter =
      !isAdminPage &&
      !isIdeaFormPage &&
      !isInitiativeFormPage &&
      !isIdeaEditPage &&
      !isInitiativeEditPage;
    const showShortFeedback = !isSignInPage && !isSignUpPage;

    return (
      <>
        {tenant && visible && (
          <PreviousPathnameContext.Provider value={previousPathname}>
            <ThemeProvider
              theme={{ ...theme, isRtl: !!this.state.locale?.startsWith('ar') }}
            >
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
                      <LoadableUserDeleted
                        userActuallyDeleted={userActuallyDeleted}
                      />
                    </LoadableModal>
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <Suspense fallback={null}>
                      <SignUpInModal onMounted={this.singUpInModalMounted} />
                    </Suspense>
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <Suspense fallback={null}>
                      <VerificationModal
                        onMounted={this.verificationModalMounted}
                      />
                    </Suspense>
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <div id="modal-portal" />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <div id="topbar-portal" />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <ConsentManager />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <Navbar
                      setRef={this.setNavbarRef}
                      setMobileNavigationRef={this.setMobileNavigationRef}
                    />
                  </ErrorBoundary>

                  <InnerContainer>
                    <HasPermission
                      item={{ type: 'route', path: location.pathname }}
                      action="access"
                    >
                      <ErrorBoundary>{children}</ErrorBoundary>
                      <HasPermission.No>
                        <ForbiddenRoute />
                      </HasPermission.No>
                    </HasPermission>
                  </InnerContainer>

                  {showFooter && (
                    <PlatformFooter showShortFeedback={showShortFeedback} />
                  )}
                </Container>
              </LiveAnnouncer>
            </ThemeProvider>
          </PreviousPathnameContext.Provider>
        )}
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  redirectsEnabled: <GetFeatureFlag name="redirects" />,
});

// Apollo
const cache = new InMemoryCache();
const httpLink = new HttpLink({ uri: ADMIN_TEMPLATES_GRAPHQL_PATH });
const authLink = new ApolloLink((operation, forward) => {
  const jwt = getJwt();

  operation.setContext({
    headers: {
      origin: '*',
      authorization: jwt ? `Bearer ${jwt}` : '',
      'Access-Control-Allow-Origin': '*',
    },
    fetchOptions: {
      mode: 'cors',
    },
  });

  return forward(operation);
});
const client = new ApolloClient({
  cache,
  link: authLink.concat(httpLink),
});

const AppWithHoC = withRouter(App);

export default (inputProps: InputProps) => (
  <ApolloProvider client={client}>
    <Data>{(dataProps) => <AppWithHoC {...dataProps} {...inputProps} />}</Data>
  </ApolloProvider>
);
