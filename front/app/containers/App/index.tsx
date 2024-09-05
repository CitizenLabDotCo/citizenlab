import 'focus-visible';
import React, { lazy, Suspense, useEffect, useState } from 'react';

import {
  Box,
  Spinner,
  useBreakpoint,
  colors,
  getTheme,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { configureScope } from '@sentry/react';
import { PreviousPathnameContext } from 'context';
import GlobalStyle from 'global-styles';
import 'intersection-observer';
import { includes, uniq } from 'lodash-es';
import 'moment-timezone';
import moment from 'moment';
import { useLocation } from 'react-router-dom';
import { RouteType } from 'routes';
import styled, { ThemeProvider } from 'styled-components';
import { SupportedLocale } from 'typings';

import { IAppConfigurationStyle } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';
import useDeleteSelf from 'api/users/useDeleteSelf';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { appLocalesMomentPairs, locales } from 'containers/App/constants';
import Authentication from 'containers/Authentication';
import MainHeader from 'containers/MainHeader';

import ErrorBoundary from 'components/ErrorBoundary';

import { trackPage } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import Navigate from 'utils/cl-router/Navigate';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import eventEmitter from 'utils/eventEmitter';
import {
  endsWith,
  isIdeaShowPage,
  isInitiativeShowPage,
  isPage,
} from 'utils/helperUtils';
import { localeStream } from 'utils/localeStream';
import { usePermission } from 'utils/permissions';
import { isAdmin, isModerator } from 'utils/permissions/roles';

import messages from './messages';
import Meta from './Meta';
import UserSessionRecordingModal from './UserSessionRecordingModal';

const ConsentManager = lazy(() => import('components/ConsentManager'));
const UserDeletedModal = lazy(() => import('./UserDeletedModal'));
const PlatformFooter = lazy(() => import('containers/PlatformFooter'));

const SkipLinkStyled = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: ${colors.black};
  color: ${colors.white};
  padding: 8px;
  z-index: 1000;
  text-align: center;
  text-decoration: none;
  &:focus {
    top: 0;
  }
`;

interface Props {
  children: React.ReactNode;
}

const locale$ = localeStream().observable;

const App = ({ children }: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const location = useLocation();
  const { formatMessage } = useIntl();

  const { mutate: signOutAndDeleteAccount } = useDeleteSelf();
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [previousPathname, setPreviousPathname] = useState<RouteType | null>(
    null
  );
  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();
  const appContainerClassName =
    isAdmin(authUser) || isModerator(authUser) ? 'admin-user-view' : '';
  const [
    userDeletedSuccessfullyModalOpened,
    setUserDeletedSuccessfullyModalOpened,
  ] = useState(false);
  const [userSuccessfullyDeleted, setUserSuccessfullyDeleted] = useState(false);

  const [locale, setLocale] = useState<SupportedLocale | null>(null);
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

    const newPreviousPathname = location.pathname as RouteType;
    const pathsToIgnore = [
      'sign-up',
      'sign-in',
      'complete-signup',
      'invite',
      'authentication-error', // TODO: JS - what is the effect here of removing?
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
  const isNativeSurveyPage = isPage('native_survey', location.pathname);

  const theme = getTheme(appConfiguration);
  const showFooter =
    !isAdminPage &&
    !isIdeaFormPage &&
    !isInitiativeFormPage &&
    !isIdeaEditPage &&
    !isInitiativeEditPage &&
    !isNativeSurveyPage;
  const { pathname } = removeLocale(location.pathname);
  const urlSegments = location.pathname.replace(/^\/+/g, '').split('/');
  const disableScroll = fullscreenModalEnabled && signUpInModalOpened;
  const isAuthenticationPending = authUser === undefined;
  const canAccessRoute = usePermission({
    item: {
      type: 'route',
      path: pathname,
    },
    action: 'access',
  });

  const showFrontOfficeNavbar = () => {
    if (isAdminPage) {
      if (!isPagesAndMenuPage) return false;
    }

    // citizen
    if (isNativeSurveyPage) return false;

    if (isSmallerThanTablet) {
      if (
        isEventPage ||
        isIdeaShowPage(urlSegments) ||
        isInitiativeShowPage(urlSegments)
      ) {
        return false;
      }
    }

    return true;
  };

  return (
    <>
      {!isAuthenticationPending && (
        <SkipLinkStyled href="#main-content">
          {formatMessage(messages.skipLinkText)}
        </SkipLinkStyled>
      )}
      {isAuthenticationPending && (
        <Box
          display="flex"
          w="100%"
          h="100%"
          justifyContent="center"
          alignItems="center"
        >
          <Spinner />
        </Box>
      )}
      <PreviousPathnameContext.Provider value={previousPathname}>
        <ThemeProvider theme={{ ...theme, isRtl: !!locale?.startsWith('ar') }}>
          <GlobalStyle />
          <Box
            className={appContainerClassName}
            display="flex"
            flexDirection="column"
            alignItems="stretch"
            position="relative"
            background={colors.white}
            /* When the fullscreen modal is enabled on a platform and
             * is currently open, we want to disable scrolling on the
             * app sitting below it (CL-1101).
             * For instance, with a fullscreen modal, we want to
             * be able to disable scrolling on the page behind the modal
             */
            overflow={disableScroll ? 'hidden' : undefined}
            minHeight="100vh"
          >
            <Meta />
            <UserSessionRecordingModal />
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
            {showFrontOfficeNavbar() && (
              <ErrorBoundary>
                <MainHeader />
              </ErrorBoundary>
            )}
            {!isAuthenticationPending && (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="stretch"
                flex="1"
                overflowY="auto"
                id="main-content"
                pt={
                  showFrontOfficeNavbar()
                    ? `${stylingConsts.menuHeight}px`
                    : undefined
                }
              >
                {canAccessRoute ? (
                  <ErrorBoundary>{children}</ErrorBoundary>
                ) : (
                  <Navigate to="/" />
                )}
              </Box>
            )}
            {showFooter && (
              <Suspense fallback={null}>
                <PlatformFooter />
              </Suspense>
            )}
            <ErrorBoundary>
              <div id="mobile-nav-portal" />
            </ErrorBoundary>
          </Box>
        </ThemeProvider>
      </PreviousPathnameContext.Provider>
    </>
  );
};

export default App;
