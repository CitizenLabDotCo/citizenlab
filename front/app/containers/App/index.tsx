import { configureScope } from '@sentry/react';
import 'focus-visible';
import GlobalStyle from 'global-styles';
import 'intersection-observer';
import { includes, uniq } from 'lodash-es';
import moment from 'moment';
import 'moment-timezone';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { combineLatest } from 'rxjs';
import { tap } from 'rxjs/operators';
import { endsWith, isNilOrError, isPage } from 'utils/helperUtils';

// constants
import { appLocalesMomentPairs, locales } from 'containers/App/constants';

// context
import { PreviousPathnameContext } from 'context';
import { trackPage } from 'utils/analytics';

// analytics
const ConsentManager = lazy(() => import('components/ConsentManager'));

// components
import ErrorBoundary from 'components/ErrorBoundary';
import Navigate from 'utils/cl-router/Navigate';
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
import { IAppConfigurationStyle } from 'api/app_configuration/types';
import signOut from 'api/authentication/sign_in_out/signOut';
import signOutAndDeleteAccount from 'api/authentication/sign_in_out/signOutAndDeleteAccount';
import { authUserStream } from 'services/auth';
import { localeStream } from 'services/locale';

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { useLocation } from 'react-router-dom';

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
  ${(props) =>
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
    min-height: calc(100vh - ${(props) => props.theme.menuHeight}px - ${(
    props
  ) => props.theme.mobileMenuHeight}px);
  `}
`;

export interface IOpenPostPageModalEvent {
  id: string;
  slug: string;
  type: 'idea' | 'initiative';
}

interface Props {
  children: React.ReactNode;
}

const authUser$ = authUserStream().observable;
const locale$ = localeStream().observable;

const App = ({ children }: Props) => {
  const location = useLocation();
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [previousPathname, setPreviousPathname] = useState<string | null>(null);
  const { data: appConfiguration } = useAppConfiguration();

  const [modalId, setModalId] = useState<string | null>(null);
  const [modalSlug, setModalSlug] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'idea' | 'initiative' | null>(
    null
  );
  const [
    userDeletedSuccessfullyModalOpened,
    setUserDeletedSuccessfullyModalOpened,
  ] = useState(false);
  const [userSuccessfullyDeleted, setUserSuccessfullyDeleted] = useState(false);
  const [navbarRef, setNavbarRef] = useState<HTMLElement | null>(null);
  const [mobileNavbarRef, setMobileNavbarRef] = useState<HTMLElement | null>(
    null
  );
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
      ]).subscribe(([_, locale]) => {
        const momentLoc = appLocalesMomentPairs[locale] || 'en';
        moment.locale(momentLoc);
        setLocale(locale);
      }),

      eventEmitter
        .observeEvent<IOpenPostPageModalEvent>('cardClick')
        .subscribe(({ eventValue: { id, slug, type } }) => {
          openPostPageModal(id, slug, type);
        }),

      eventEmitter.observeEvent('closeIdeaModal').subscribe(() => {
        closePostPageModal();
      }),

      eventEmitter
        .observeEvent('deleteProfileAndShowSuccessModal')
        .subscribe(() => {
          signOutAndDeleteAccount().then((success) => {
            if (success) {
              setUserDeletedSuccessfullyModalOpened(true);
              setUserSuccessfullyDeleted(true);
            } else {
              setUserDeletedSuccessfullyModalOpened(true);
              setUserSuccessfullyDeleted(false);
            }
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
  ]);

  useEffect(() => {
    trackPage(location.pathname);
  }, [location.pathname]);

  const openPostPageModal = (
    id: string,
    slug: string,
    type: 'idea' | 'initiative'
  ) => {
    setModalId(id);
    setModalSlug(slug);
    setModalType(type);
  };

  const closePostPageModal = () => {
    setModalId(null);
    setModalSlug(null);
    setModalType(null);
  };

  const closeUserDeletedModal = () => {
    setUserDeletedSuccessfullyModalOpened(false);
  };

  const isAdminPage = isPage('admin', location.pathname);
  const isInitiativeFormPage = isPage('initiative_form', location.pathname);
  const isIdeaFormPage = isPage('idea_form', location.pathname);
  const isIdeaEditPage = isPage('idea_edit', location.pathname);
  const isInitiativeEditPage = isPage('initiative_edit', location.pathname);
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
                  <PostPageFullscreenModal
                    signUpInModalOpened={signUpInModalOpened}
                    type={modalType}
                    postId={modalId}
                    slug={modalSlug}
                    close={closePostPageModal}
                    navbarRef={navbarRef}
                    mobileNavbarRef={mobileNavbarRef}
                  />
                </Suspense>
              </ErrorBoundary>
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
              <ErrorBoundary>
                <MainHeader setRef={setNavbarRef} />
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
                    <Navigate to="/" />
                  </HasPermission.No>
                </HasPermission>
              </InnerContainer>
              {showFooter && (
                <Suspense fallback={null}>
                  <PlatformFooter />
                </Suspense>
              )}
              {showMobileNav && <MobileNavbar setRef={setMobileNavbarRef} />}
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
