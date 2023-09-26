import 'focus-visible';
import GlobalStyle from 'global-styles';
import 'intersection-observer';
import { includes, uniq } from 'lodash-es';
import moment from 'moment';
import 'moment-timezone';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { endsWith, isPage } from 'utils/helperUtils';

// constants
import { appLocalesMomentPairs, locales } from 'containers/App/constants';

// context
import { PreviousPathnameContext } from 'context';
import { trackPage } from 'utils/analytics';

// analytics
const ConsentManager = lazy(() => import('components/ConsentManager'));

// components
import { Box, Spinner, useBreakpoint } from '@citizenlab/cl2-component-library';
import ErrorBoundary from 'components/ErrorBoundary';
import Navigate from 'utils/cl-router/Navigate';
import Authentication from 'containers/Authentication';
import MainHeader from 'containers/MainHeader';
import MobileNavbar from 'containers/MobileNavbar';
import Meta from './Meta';
const UserDeletedModal = lazy(() => import('./UserDeletedModal'));
const PlatformFooter = lazy(() => import('containers/PlatformFooter'));

// auth
import HasPermission from 'components/HasPermission';

// services
import { IAppConfigurationStyle } from 'api/app_configuration/types';
import useDeleteSelf from 'api/users/useDeleteSelf';
import { localeStream } from 'services/locale';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { useLocation } from 'react-router-dom';

// events
import eventEmitter from 'utils/eventEmitter';

// style
import styled, { ThemeProvider } from 'styled-components';
import { getTheme, stylingConsts } from 'utils/styleUtils';

// typings
import { Locale } from 'typings';

// utils
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import useAuthUser from 'api/me/useAuthUser';
import { configureScope } from '@sentry/react';

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
  ${(props) =>
    props.disableScroll &&
    `
      height: 100%;
      overflow: hidden;
    `};
`;

interface Props {
  children: React.ReactNode;
}

const locale$ = localeStream().observable;

const App = ({ children }: Props) => {
  const location = useLocation();
  const { mutate: signOutAndDeleteAccount } = useDeleteSelf();
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [previousPathname, setPreviousPathname] = useState<string | null>(null);
  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser, isLoading } = useAuthUser();

  const [
    userDeletedSuccessfullyModalOpened,
    setUserDeletedSuccessfullyModalOpened,
  ] = useState(false);
  const [userSuccessfullyDeleted, setUserSuccessfullyDeleted] = useState(false);

  const [locale, setLocale] = useState<Locale | null>(null);
  const [signUpInModalOpened, setSignUpInModalOpened] = useState(false);

  const redirectsEnabled = useFeatureFlag({ name: 'redirects' });

  const fullscreenModalEnabled = useFeatureFlag({
    name: 'franceconnect_login',
  });

  useEffect(() => {
    if (appConfiguration && !isAppInitialized) {
      moment.tz.setDefault(
        appConfiguration.data.attributes.settings.core.timezone
      );

      uniq(
        appConfiguration.data.attributes.settings.core.locales
          .filter((locale) => locale !== 'en')
          .map((locale) => appLocalesMomentPairs[locale])
      ).forEach((locale) => require(`moment/locale/${locale}.js`));

      if (appConfiguration.data.attributes.settings.core.weglot_api_key) {
        const script = document.createElement('script');
        script.async = false;
        script.defer = false;
        document.head.appendChild(script);

        script.onload = function () {
          window.Weglot.initialize({
            api_key:
              appConfiguration.data.attributes.settings.core.weglot_api_key,
          });
        };

        script.src = 'https://cdn.weglot.com/weglot.min.js';
      }

      if (
        appConfiguration.data.attributes.style &&
        appConfiguration.data.attributes.style.customFontAdobeId
      ) {
        import('webfontloader').then((WebfontLoader) => {
          WebfontLoader.load({
            typekit: {
              id: (
                appConfiguration.data.attributes.style as IAppConfigurationStyle
              ).customFontAdobeId,
            },
          });
        });
      } else if (
        appConfiguration.data.attributes.style &&
        appConfiguration.data.attributes.style.customFontURL
      ) {
        import('webfontloader').then((WebfontLoader) => {
          const fontName = (
            appConfiguration.data.attributes.style as IAppConfigurationStyle
          ).customFontName;
          const fontURL = (
            appConfiguration.data.attributes.style as IAppConfigurationStyle
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
      setIsAppInitialized(true);
    }
  }, [appConfiguration, isAppInitialized]);

  useEffect(() => {
    const handleCustomRedirect = () => {
      const { pathname } = location;
      const urlSegments = pathname.replace(/^\/+/g, '').split('/');
      const pathnameWithoutLocale = removeLocale(pathname).pathname?.replace(
        /\//,
        ''
      );

      if (
        appConfiguration &&
        appConfiguration.data.attributes.settings.redirects
      ) {
        const { rules } = appConfiguration.data.attributes.settings.redirects;
        rules.forEach((rule) => {
          if (
            urlSegments.length > 1 &&
            includes(locales, urlSegments[0]) &&
            pathnameWithoutLocale === rule.path
          ) {
            window.location.href = rule.target;
          }
        });
      }
    };

    const newPreviousPathname = location.pathname;
    const pathsToIgnore = [
      'sign-up',
      'sign-in',
      'complete-signup',
      'invite',
      'authentication-error',
    ];
    setPreviousPathname(
      !endsWith(newPreviousPathname, pathsToIgnore)
        ? newPreviousPathname
        : previousPathname
    );
    if (redirectsEnabled) {
      handleCustomRedirect();
    }

    const subscriptions = [
      locale$.subscribe((locale) => {
        const momentLoc = appLocalesMomentPairs[locale] || 'en';
        moment.locale(momentLoc);
        setLocale(locale);
      }),

      eventEmitter
        .observeEvent('deleteProfileAndShowSuccessModal')
        .subscribe(() => {
          signOutAndDeleteAccount(undefined, {
            onSuccess: () => {
              setUserDeletedSuccessfullyModalOpened(true);
              setUserSuccessfullyDeleted(true);
            },
            onError: () => {
              setUserDeletedSuccessfullyModalOpened(true);
              setUserSuccessfullyDeleted(false);
            },
          });
        }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [
    location.pathname,
    previousPathname,
    redirectsEnabled,
    appConfiguration,
    location,
    signOutAndDeleteAccount,
  ]);

  useEffect(() => {
    if (authUser) {
      configureScope((scope) => {
        scope.setUser({
          id: authUser.data.id,
        });
      });
    }
  }, [authUser]);

  useEffect(() => {
    trackPage(location.pathname);
  }, [location.pathname]);

  const closeUserDeletedModal = () => {
    setUserDeletedSuccessfullyModalOpened(false);
  };

  const isAdminPage = isPage('admin', location.pathname);
  const isPagesAndMenuPage = isPage('pages_menu', location.pathname);
  const isInitiativeFormPage = isPage('initiative_form', location.pathname);
  const isIdeaFormPage = isPage('idea_form', location.pathname);
  const isIdeaEditPage = isPage('idea_edit', location.pathname);
  const isInitiativeEditPage = isPage('initiative_edit', location.pathname);
  const isEventPage = isPage('event_page', location.pathname);
  const isSmallerThanTablet = useBreakpoint('tablet');

  const theme = getTheme(appConfiguration);
  const showFooter =
    !isAdminPage &&
    !isIdeaFormPage &&
    !isInitiativeFormPage &&
    !isIdeaEditPage &&
    !isInitiativeEditPage;
  const showMobileNav =
    isSmallerThanTablet &&
    !isAdminPage &&
    !isIdeaFormPage &&
    !isInitiativeFormPage &&
    !isIdeaEditPage &&
    !isInitiativeEditPage;
  const { pathname } = removeLocale(location.pathname);
  const showFrontOfficeNavbar =
    (isEventPage && !isSmallerThanTablet) || // Don't show the navbar on (mobile) event page
    (!isAdminPage && !isEventPage) ||
    isPagesAndMenuPage;

  // Ensure authUser is loaded before rendering the app
  if (!authUser && isLoading) {
    return (
      <Box
        display="flex"
        w="100%"
        h="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner />
      </Box>
    );
  }

  return (
    <>
      {appConfiguration && (
        <PreviousPathnameContext.Provider value={previousPathname}>
          <ThemeProvider
            theme={{ ...theme, isRtl: !!locale?.startsWith('ar') }}
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
                  <UserDeletedModal
                    modalOpened={userDeletedSuccessfullyModalOpened}
                    closeUserDeletedModal={closeUserDeletedModal}
                    userSuccessfullyDeleted={userSuccessfullyDeleted}
                  />
                </Suspense>
              </ErrorBoundary>
              <ErrorBoundary>
                <Authentication setModalOpen={setSignUpInModalOpened} />
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
              {showFrontOfficeNavbar && (
                <ErrorBoundary>
                  <MainHeader />
                </ErrorBoundary>
              )}
              <Box
                display="flex"
                flexDirection="column"
                alignItems="stretch"
                pt={
                  showFrontOfficeNavbar
                    ? `${stylingConsts.menuHeight}px`
                    : undefined
                }
                minHeight={
                  isSmallerThanTablet
                    ? `calc(100vh - ${stylingConsts.menuHeight}px - ${
                        stylingConsts.mobileMenuHeight * 2
                      }px)`
                    : `calc(100vh - ${stylingConsts.menuHeight}px)`
                }
              >
                <HasPermission
                  item={{
                    type: 'route',
                    path: pathname,
                  }}
                  action="access"
                >
                  <ErrorBoundary>{children}</ErrorBoundary>
                  <HasPermission.No>
                    <Navigate to="/" />
                  </HasPermission.No>
                </HasPermission>
              </Box>
              {showFooter && (
                <Suspense fallback={null}>
                  <PlatformFooter />
                </Suspense>
              )}
              {showMobileNav && <MobileNavbar />}
              <ErrorBoundary>
                <div id="mobile-nav-portal" />
              </ErrorBoundary>
            </Container>
          </ThemeProvider>
        </PreviousPathnameContext.Provider>
      )}
    </>
  );
};

export default App;
