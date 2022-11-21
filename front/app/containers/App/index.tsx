import { configureScope } from '@sentry/react';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';
import 'focus-visible';
import GlobalStyle from 'global-styles';
import 'intersection-observer';
import { has, includes, uniq } from 'lodash-es';
import moment from 'moment';
import 'moment-timezone';
import { parse } from 'qs';
import React, { lazy, PureComponent, Suspense } from 'react';
import { adopt } from 'react-adopt';
import { combineLatest, Subscription } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import smoothscroll from 'smoothscroll-polyfill';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { endsWith, isDesktop, isNilOrError, isPage } from 'utils/helperUtils';

// constants
import { appLocalesMomentPairs, locales } from 'containers/App/constants';

// context
import { PreviousPathnameContext } from 'context';
import { trackPage } from 'utils/analytics';

// analytics
const ConsentManager = lazy(() => import('components/ConsentManager'));

// components
import ErrorBoundary from 'components/ErrorBoundary';
import Outlet from 'components/Outlet';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import SignUpInModal from 'components/SignUpIn/SignUpInModal';
import MainHeader from 'containers/MainHeader';
import MobileNavbar from 'containers/MobileNavbar';
import Meta from './Meta';
const UserDeletedModal = lazy(() => import('./UserDeletedModal'));
const PlatformFooter = lazy(() => import('containers/PlatformFooter'));
const PostPageFullscreenModal = lazy(() => import('./PostPageFullscreenModal'));

// auth
import HasPermission from 'components/HasPermission';

// services
import {
  currentAppConfigurationStream,
  IAppConfiguration,
  IAppConfigurationStyle,
} from 'services/appConfiguration';
import {
  authUserStream,
  signOut,
  signOutAndDeleteAccount,
} from 'services/auth';
import { localeStream } from 'services/locale';
import { IUser } from 'services/users';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

// events
import { openSignUpInModal$ } from 'components/SignUpIn/events';
import eventEmitter from 'utils/eventEmitter';

// style
import styled, { ThemeProvider } from 'styled-components';
import { getTheme, media } from 'utils/styleUtils';

// typings
import { Locale } from 'typings';

// utils
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import openSignUpInModalIfNecessary from './openSignUpInModalIfNecessary';

const Container = styled.div<{
  disableScroll?: boolean;
}>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  background: #fff;

  // for instances with e.g. a fullscreen modal, we want to
  // be able to disable scrolling on the page behind the modal
  ${(props: any) =>
    props.disableScroll &&
    `
      height: 100%;
      overflow: hidden;
    `};
`;

const InnerContainer = styled.div`
  width: 100vw;
  padding-top: ${(props) => props.theme.menuHeight}px;
  min-height: calc(100vh - ${(props) => props.theme.menuHeight}px);
  display: flex;
  flex-direction: column;
  align-items: stretch;

  ${media.tablet`
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
  fullscreenModalEnabled: GetFeatureFlagChildProps;
  windowSize: GetWindowSizeChildProps;
}

interface Props extends WithRouterProps, InputProps, DataProps {}

export type TAuthUser = IUser | null | undefined;

interface State {
  previousPathname: string | null;
  tenant: IAppConfiguration | null;
  authUser: TAuthUser;
  modalId: string | null;
  modalSlug: string | null;
  modalType: 'idea' | 'initiative' | null;
  userDeletedSuccessfullyModalOpened: boolean;
  userSuccessfullyDeleted: boolean;
  signUpInModalMounted: boolean;
  signUpInModalOpened: boolean;
  verificationModalMounted: boolean;
  navbarRef: HTMLElement | null;
  mobileNavbarRef: HTMLElement | null;
  locale: Locale | null;
  signUpInModalClosed: boolean;
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
      userDeletedSuccessfullyModalOpened: false,
      userSuccessfullyDeleted: false,
      signUpInModalMounted: false,
      signUpInModalOpened: false, // we need to apply CSS when modal is opened
      verificationModalMounted: false,
      navbarRef: null,
      mobileNavbarRef: null,
      locale: null,
      signUpInModalClosed: false, // we need to know if modal was closed not to reopen it again. See ccd951c4ee
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { redirectsEnabled } = this.props;
    const authUser$ = authUserStream().observable;
    const locale$ = localeStream().observable;
    const tenant$ = currentAppConfigurationStream().observable;

    this.unlisten = clHistory.listen(({ location }) => {
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
      trackPage(location.pathname);
    });

    trackPage(location.pathname);

    smoothscroll.polyfill();

    this.subscriptions = [
      combineLatest([
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
                .filter((locale) => locale !== 'en')
                .map((locale) => appLocalesMomentPairs[locale])
            ).forEach((locale) => require(`moment/locale/${locale}.js`));
          })
        ),
      ]).subscribe(([authUser, locale, tenant]) => {
        const momentLoc = appLocalesMomentPairs[locale] || 'en';
        moment.locale(momentLoc);
        this.setState({ tenant, authUser, locale });
      }),

      tenant$.pipe(first()).subscribe((tenant) => {
        if (tenant.data.attributes.settings.core.weglot_api_key) {
          const script = document.createElement('script');
          script.async = false;
          script.defer = false;
          document.head.appendChild(script);

          script.onload = function () {
            window.Weglot.initialize({
              api_key: tenant.data.attributes.settings.core.weglot_api_key,
            });
          };

          script.src = 'https://cdn.weglot.com/weglot.min.js';
        }

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
        } else if (
          tenant.data.attributes.style &&
          tenant.data.attributes.style.customFontURL
        ) {
          import('webfontloader').then((WebfontLoader) => {
            const fontName = (
              tenant.data.attributes.style as IAppConfigurationStyle
            ).customFontName;
            const fontURL = (
              tenant.data.attributes.style as IAppConfigurationStyle
            ).customFontURL;
            if (fontName !== undefined && fontURL !== undefined) {
              WebfontLoader.load({
                custom: {
                  families: [fontName],
                  urls: [fontURL],
                },
              });
            }
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

      eventEmitter
        .observeEvent('deleteProfileAndShowSuccessModal')
        .subscribe(() => {
          signOutAndDeleteAccount().then((success) => {
            if (success) {
              this.setState({
                userDeletedSuccessfullyModalOpened: true,
                userSuccessfullyDeleted: true,
              });
            } else {
              this.setState({
                userDeletedSuccessfullyModalOpened: true,
                userSuccessfullyDeleted: false,
              });
            }
          });
        }),

      openSignUpInModal$.subscribe(({ eventValue: metaData }) => {
        // Sometimes we need to still open the sign up/in modal
        // after login is completed, if registration is not complete.
        // But in that case, componentDidUpdate is somehow called before
        // the modal is closed which overwrites the metaData.
        // This slightly dirty hack covers that case.
        if (metaData) {
          return;
        } else {
          // if metaData is undefined, it means we're closing
          // the sign up/in modal.
          this.setState({ signUpInModalMounted: false });
          setTimeout(() => {
            this.forceUpdate();
          }, 1);
        }
      }),
    ];
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { authUser, tenant, signUpInModalMounted, verificationModalMounted } =
      this.state;
    const {
      redirectsEnabled,
      location: { pathname, search },
    } = this.props;

    if (
      redirectsEnabled &&
      (prevState.tenant !== tenant || prevProps.location.pathname !== pathname)
    ) {
      this.handleCustomRedirect();
    }

    const isAuthError = endsWith(pathname, 'authentication-error');
    const isInvitation = endsWith(pathname, '/invite');
    const { signUpInModalClosed } = this.state;

    openSignUpInModalIfNecessary(
      authUser,
      isAuthError && !signUpInModalClosed,
      isInvitation && !signUpInModalClosed,
      signUpInModalMounted,
      search
    );

    // when -both- the authUser is initiated and the verification modal component mounted
    // we check if a 'verification_success' or 'verification_error' url param is present.
    // if so, we open the verication modal with the appropriate step
    if (
      !isNilOrError(authUser) &&
      verificationModalMounted &&
      (prevState.authUser === undefined || !prevState.verificationModalMounted)
    ) {
      this.openVerificationModalIfSuccessOrError(search);
    }
  }

  openVerificationModalIfSuccessOrError(search: string) {
    const { location } = this.props;
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
        error: location.query?.error || null,
        context: null,
      });
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
    this.setState({ userDeletedSuccessfullyModalOpened: false });
  };

  updateModalOpened = (opened: boolean) => {
    this.setState({ signUpInModalOpened: opened });
  };

  setNavbarRef = (navbarRef: HTMLElement) => {
    this.setState({ navbarRef });
  };

  setMobileNavigationRef = (mobileNavbarRef: HTMLElement) => {
    this.setState({ mobileNavbarRef });
  };

  handleModalMounted = (id: string) => {
    if (id === 'verification') {
      this.setState({ verificationModalMounted: true });
    }
  };

  handleSignUpInModalMounted = () => {
    this.setState({ signUpInModalMounted: true });
  };

  handleSignUpInModalClosed = () => {
    this.setState({ signUpInModalClosed: true });
  };

  render() {
    const { location, children, windowSize, fullscreenModalEnabled } =
      this.props;
    const {
      previousPathname,
      tenant,
      modalId,
      modalSlug,
      modalType,
      userDeletedSuccessfullyModalOpened,
      userSuccessfullyDeleted,
      navbarRef,
      mobileNavbarRef,
      signUpInModalOpened,
    } = this.state;

    const isAdminPage = isPage('admin', location.pathname);
    const isInitiativeFormPage = isPage('initiative_form', location.pathname);
    const isIdeaFormPage = isPage('idea_form', location.pathname);
    const isIdeaEditPage = isPage('idea_edit', location.pathname);
    const isInitiativeEditPage = isPage('initiative_edit', location.pathname);
    const isDesktopUser = windowSize && isDesktop(windowSize);
    const fullScreenModalEnabledAndOpen =
      fullscreenModalEnabled && signUpInModalOpened;

    const theme = getTheme(tenant);
    const showFooter =
      !isAdminPage &&
      !isIdeaFormPage &&
      !isInitiativeFormPage &&
      !isIdeaEditPage &&
      !isInitiativeEditPage;
    const showMobileNav =
      !isDesktopUser &&
      !isAdminPage &&
      !isIdeaFormPage &&
      !isInitiativeFormPage &&
      !isIdeaEditPage &&
      !isInitiativeEditPage;
    const { pathname } = removeLocale(location.pathname);

    return (
      <>
        {tenant && (
          <PreviousPathnameContext.Provider value={previousPathname}>
            <ThemeProvider
              theme={{ ...theme, isRtl: !!this.state.locale?.startsWith('ar') }}
            >
              <GlobalStyle />
              <Container
                // when the fullscreen modal is enabled on a platform and
                // is currently open, we want to disable scrolling on the
                // app sitting below it (CL-1101)
                disableScroll={fullscreenModalEnabled && signUpInModalOpened}
              >
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
                  <Suspense fallback={null}>
                    <UserDeletedModal
                      modalOpened={userDeletedSuccessfullyModalOpened}
                      closeUserDeletedModal={this.closeUserDeletedModal}
                      userSuccessfullyDeleted={userSuccessfullyDeleted}
                    />
                  </Suspense>
                </ErrorBoundary>
                <ErrorBoundary>
                  <SignUpInModal
                    onMounted={this.handleSignUpInModalMounted}
                    onOpened={this.updateModalOpened}
                    onClosed={this.handleSignUpInModalClosed}
                    fullScreenModal={fullscreenModalEnabled}
                  />
                </ErrorBoundary>
                <Outlet
                  id="app.containers.App.modals"
                  onMounted={this.handleModalMounted}
                />
                <ErrorBoundary>
                  <div id="modal-portal" />
                </ErrorBoundary>
                <ErrorBoundary>
                  <div id="topbar-portal" />
                </ErrorBoundary>
                <ErrorBoundary>
                  <Suspense fallback={null}>
                    <ConsentManager />
                  </Suspense>
                </ErrorBoundary>
                <ErrorBoundary>
                  <MainHeader setRef={this.setNavbarRef} />
                </ErrorBoundary>
                <InnerContainer>
                  <HasPermission
                    item={{
                      type: 'route',
                      path: pathname,
                    }}
                    action="access"
                  >
                    <ErrorBoundary>{children}</ErrorBoundary>
                    <HasPermission.No>
                      <ForbiddenRoute />
                    </HasPermission.No>
                  </HasPermission>
                </InnerContainer>
                {showFooter && (
                  <Suspense fallback={null}>
                    <PlatformFooter />
                  </Suspense>
                )}
                {showMobileNav && !fullScreenModalEnabledAndOpen && (
                  <MobileNavbar setRef={this.setMobileNavigationRef} />
                )}
                <ErrorBoundary>
                  <div id="mobile-nav-portal" />
                </ErrorBoundary>
              </Container>
            </ThemeProvider>
          </PreviousPathnameContext.Provider>
        )}
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  windowSize: <GetWindowSize />,
  redirectsEnabled: <GetFeatureFlag name="redirects" />,
  // CL-1101, FranceConnect platforms have full screen login experience
  fullscreenModalEnabled: <GetFeatureFlag name="franceconnect_login" />,
});

const AppWithHoC = withRouter(App);

export default (inputProps: InputProps) => (
  <Data>{(dataProps) => <AppWithHoC {...dataProps} {...inputProps} />}</Data>
);
