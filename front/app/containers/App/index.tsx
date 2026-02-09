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
import * as Sentry from '@sentry/react';
import GlobalStyle from 'global-styles';
import 'intersection-observer';
// moment-timezone extends the regular moment library,
// so there's no need to import both moment and moment-timezone
import moment from 'moment-timezone';
import { useLocation } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

import { IAppConfigurationStyle } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';
import useDeleteSelf from 'api/users/useDeleteSelf';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import {
  appLocalesMomentPairs,
  localeGetter,
  locales,
} from 'containers/App/constants';
import Authentication from 'containers/Authentication';
import MainHeader from 'containers/MainHeader';

import ConsentManager from 'components/ConsentManager';
import ErrorBoundary from 'components/ErrorBoundary';

import { trackPage } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import Navigate from 'utils/cl-router/Navigate';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import eventEmitter from 'utils/eventEmitter';
import { initiativeShowPageSlug, isPage } from 'utils/helperUtils';
import { usePermission } from 'utils/permissions';
import { isAdmin, isModerator } from 'utils/permissions/roles';

import messages from './messages';
import Meta from './Meta';
import { ModalQueueProvider } from './ModalQueue';
import CommunityMonitorModalManager from './ModalQueue/modals/CommunityMonitor/ModalManager';
import UserSessionRecordingModalManager from './ModalQueue/modals/UserSessionRecording/ModalManager';

const UserDeletedModal = lazy(() => import('./UserDeletedModal'));
const PlatformFooter = lazy(() => import('containers/PlatformFooter'));

const SkipLinkStyled = styled.a`
  position: absolute;
  top: -40px;
  left: 0;
  background: ${colors.black};
  color: ${colors.white};
  padding: 8px;
  z-index: 10000;
  text-align: center;
  text-decoration: none;
  &:focus {
    top: 0;
  }
  &:hover {
    color: ${colors.teal200};
  }
`;

interface Props {
  children: React.ReactNode;
}

const importedLocales = new Set();
async function importMomentLocaleFilePromise(momentLocale: string) {
  try {
    await localeGetter(momentLocale);
    importedLocales.add(momentLocale);
  } catch (error) {
    console.error(`Error processing locale: ${momentLocale}`, error);
  }
}

const App = ({ children }: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const location = useLocation();
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const momentLocale = appLocalesMomentPairs[locale] || 'en';

  const { mutate: signOutAndDeleteAccount } = useDeleteSelf();
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();
  const appContainerClassName =
    isAdmin(authUser) || isModerator(authUser) ? 'admin-user-view' : '';
  const [
    userDeletedSuccessfullyModalOpened,
    setUserDeletedSuccessfullyModalOpened,
  ] = useState(false);
  const [userSuccessfullyDeleted, setUserSuccessfullyDeleted] = useState(false);

  const redirectsEnabled = useFeatureFlag({ name: 'redirects' });

  // Scroll focused elements to center on mobile/tablet
  // This improves accessibility for keyboard and screen reader users and has been
  // recommended by the Frameless accessibility auditor.
  useEffect(() => {
    if (!isSmallerThanTablet) return;
    let timeoutId: number | undefined;

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      // :focus-visible for only keyboard focus
      if (!target.matches(':focus-visible')) return;
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    };

    document.addEventListener('focusin', handleFocus, true);
    return () => {
      document.removeEventListener('focusin', handleFocus, true);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSmallerThanTablet]);

  useEffect(() => {
    moment.locale(momentLocale);
  }, [momentLocale]);

  useEffect(() => {
    if (!appConfiguration) return;

    const appConfigMomentLocales = [
      // The set ensures that locales are unique. Some of our locales share the same moment locale.
      ...new Set(
        appConfiguration.data.attributes.settings.core.locales
          .filter((loc) => loc !== 'en')
          .map((loc) => appLocalesMomentPairs[loc])
      ),
    ];
    const importPromises = appConfigMomentLocales
      .filter(
        (appConfigMomentLocale) => !importedLocales.has(appConfigMomentLocale)
      )
      .map((appConfigMomentLocale) =>
        importMomentLocaleFilePromise(appConfigMomentLocale)
      );

    Promise.all(importPromises).then(() => {
      // The latest imported locale file would overwrite the moment locale (for some reason).
      moment.locale(momentLocale);
    });
  }, [appConfiguration, momentLocale]);

  useEffect(() => {
    if (appConfiguration && !isAppInitialized) {
      // Set the default timezone
      moment.tz.setDefault(
        appConfiguration.data.attributes.settings.core.timezone
      );

      // Weglot initialization
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

      // Custom Adobe fonts or custom font URLs
      if (appConfiguration.data.attributes.style?.customFontAdobeId) {
        import('webfontloader').then((WebfontLoader) => {
          WebfontLoader.load({
            typekit: {
              id: (
                appConfiguration.data.attributes.style as IAppConfigurationStyle
              ).customFontAdobeId,
            },
          });
        });
      } else if (appConfiguration.data.attributes.style?.customFontURL) {
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
                families: [
                  fontName,
                  // Support all common font variations (webfontloader will only load what exists in the CSS).
                  // n3=normal 300, n4=normal 400, n5=normal 500, n6=normal 600, n7=normal 700, n8=normal 800
                  // i3=italic 300, i4=italic 400, i5=italic 500, i6=italic 600, i7=italic 700, i8=italic 800
                  `${fontName}:n3,n4,n5,n6,n7,n8,i3,i4,i5,i6,i7,i8`,
                ],
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
      const localeInUrl = urlSegments[0];
      const pathnameWithoutLocale = removeLocale(pathname).pathname?.replace(
        /\//,
        ''
      );

      if (appConfiguration?.data.attributes.settings.redirects) {
        const { rules } = appConfiguration.data.attributes.settings.redirects;
        rules.forEach((rule) => {
          if (
            urlSegments.length > 1 &&
            locales.includes(localeInUrl) &&
            pathnameWithoutLocale === rule.path
          ) {
            const queryString = location.search;
            const separator = rule.target.includes('?') ? '&' : '?';
            const targetUrl = queryString
              ? `${rule.target}${separator}${queryString.slice(1)}`
              : rule.target;
            window.location.href = targetUrl;
          }
        });
      }
    };

    if (redirectsEnabled) {
      handleCustomRedirect();
    }
  }, [redirectsEnabled, appConfiguration, location]);

  useEffect(() => {
    const subscriptions = [
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
  }, [signOutAndDeleteAccount]);

  useEffect(() => {
    if (authUser) {
      Sentry.getCurrentScope().setUser({
        id: authUser.data.id,
      });
    }
  }, [authUser]);

  useEffect(() => {
    trackPage(location.pathname);
  }, [location.pathname]);

  const urlSegments = location.pathname.replace(/^\/+/g, '').split('/');

  // Redirect from /initiatives/:slug to /ideas/:slug to make sure old initiative links still work
  useEffect(() => {
    if (initiativeShowPageSlug(urlSegments)) {
      const slug = initiativeShowPageSlug(urlSegments);
      clHistory.replace(`/ideas/${slug}`);
    }
  }, [urlSegments]);

  const closeUserDeletedModal = () => {
    setUserDeletedSuccessfullyModalOpened(false);
  };

  const isAdminPage = isPage('admin', location.pathname);
  const isPagesAndMenuPage = isPage('pages_menu', location.pathname);
  const isHomePageBuilderRoute = location.pathname.match(
    /\/admin\/pages-menu\/homepage-builder/
  );
  const isIdeaFormPage = isPage('idea_form', location.pathname);
  const isIdeaEditPage = isPage('idea_edit', location.pathname);
  const isNativeSurveyPage = isPage('native_survey', location.pathname);
  const isIdeasFeedPage = isPage('ideas_feed', location.pathname);
  const theme = getTheme(appConfiguration);
  const showFooter =
    !isAdminPage &&
    !isIdeaFormPage &&
    !isIdeaEditPage &&
    !isNativeSurveyPage &&
    !isIdeasFeedPage;
  const { pathname } = removeLocale(location.pathname);
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
      if (!isPagesAndMenuPage || isHomePageBuilderRoute) return false;
    }

    // citizen
    if (
      isNativeSurveyPage ||
      isIdeaFormPage ||
      isIdeaEditPage ||
      isIdeasFeedPage
    ) {
      return false;
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
      <ThemeProvider theme={{ ...theme, isRtl: locale.startsWith('ar') }}>
        <ModalQueueProvider>
          <GlobalStyle />
          <Box
            className={appContainerClassName}
            display="flex"
            flexDirection="column"
            alignItems="stretch"
            position="relative"
            background={colors.white}
            minHeight="100vh"
          >
            <Meta />
            <ErrorBoundary>
              <UserSessionRecordingModalManager />
              <ConsentManager />
              <CommunityMonitorModalManager />
              <UserDeletedModal
                modalOpened={userDeletedSuccessfullyModalOpened}
                closeUserDeletedModal={closeUserDeletedModal}
                userSuccessfullyDeleted={userSuccessfullyDeleted}
              />
            </ErrorBoundary>
            <ErrorBoundary>
              <Authentication />
            </ErrorBoundary>
            <ErrorBoundary>
              <div id="modal-portal" />
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
        </ModalQueueProvider>
      </ThemeProvider>
    </>
  );
};

export default App;
