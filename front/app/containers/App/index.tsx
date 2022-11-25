import { configureScope } from '@sentry/react';
import 'focus-visible';
import GlobalStyle from 'global-styles';
import 'intersection-observer';
import { includes, uniq } from 'lodash-es';
import moment from 'moment';
import 'moment-timezone';
import React, { lazy, PureComponent, Suspense } from 'react';
import { adopt } from 'react-adopt';
import { combineLatest, Subscription } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import smoothscroll from 'smoothscroll-polyfill';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import {
  endsWith,
  isDesktop,
  isNilOrError,
  isNil,
  isPage,
} from 'utils/helperUtils';

// constants
import { appLocalesMomentPairs, locales } from 'containers/App/constants';

// context
import { PreviousPathnameContext } from 'context';
import { trackPage } from 'utils/analytics';

// analytics
const ConsentManager = lazy(() => import('components/ConsentManager'));

// components
import ErrorBoundary from 'components/ErrorBoundary';
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import Authentication from 'containers/Authentication';
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
import { TAuthUser } from 'hooks/useAuthUser';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

// events
import eventEmitter from 'utils/eventEmitter';

// style
import styled, { ThemeProvider } from 'styled-components';
import { getTheme, media } from 'utils/styleUtils';

// typings
import { Locale } from 'typings';

// utils
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';

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

interface State {
  previousPathname: string | null;
  appConfiguration: IAppConfiguration | null;
  authUser: TAuthUser;
  modalId: string | null;
  modalSlug: string | null;
  modalType: 'idea' | 'initiative' | null;
  userDeletedSuccessfullyModalOpened: boolean;
  userSuccessfullyDeleted: boolean;
  navbarRef: HTMLElement | null;
  mobileNavbarRef: HTMLElement | null;
  locale: Locale | null;
  signUpInModalOpened: boolean;
}

class App extends PureComponent<Props, State> {
  subscriptions: Subscription[];
  unlisten: () => void;

  constructor(props) {
    super(props);
    this.state = {
      previousPathname: null,
      appConfiguration: null,
      authUser: undefined,
      modalId: null,
      modalSlug: null,
      modalType: null,
      userDeletedSuccessfullyModalOpened: false,
      userSuccessfullyDeleted: false,
      navbarRef: null,
      mobileNavbarRef: null,
      locale: null,
      signUpInModalOpened: false,
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
        this.setState({
          appConfiguration: tenant,
          authUser: !isNil(authUser) ? authUser.data : null,
          locale,
        });
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
    ];
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { appConfiguration } = this.state;
    const {
      redirectsEnabled,
      location: { pathname },
    } = this.props;

    if (
      redirectsEnabled &&
      (prevState.appConfiguration !== appConfiguration ||
        prevProps.location.pathname !== pathname)
    ) {
      this.handleCustomRedirect();
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
    const { appConfiguration } = this.state;
    const urlSegments = pathname.replace(/^\/+/g, '').split('/');

    if (
      !isNilOrError(appConfiguration) &&
      appConfiguration.data.attributes.settings.redirects
    ) {
      const { rules } = appConfiguration.data.attributes.settings.redirects;

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

  setNavbarRef = (navbarRef: HTMLElement) => {
    this.setState({ navbarRef });
  };

  setMobileNavigationRef = (mobileNavbarRef: HTMLElement) => {
    this.setState({ mobileNavbarRef });
  };

  handleSignUpInModalOpened = (isOpened: boolean) => {
    this.setState({ signUpInModalOpened: isOpened });
  };

  render() {
    const { location, children, windowSize, fullscreenModalEnabled } =
      this.props;
    const {
      previousPathname,
      appConfiguration,
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

    const theme = getTheme(appConfiguration);
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
        {appConfiguration && (
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
                      signUpInModalOpened={signUpInModalOpened}
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
                  <Authentication
                    authUser={this.state.authUser}
                    onModalOpenedStateChange={this.handleSignUpInModalOpened}
                  />
                </ErrorBoundary>
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
