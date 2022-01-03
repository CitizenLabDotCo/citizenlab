import React, { PureComponent, Suspense, lazy } from 'react';
import { adopt } from 'react-adopt';
import { Subscription, combineLatest } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { uniq, includes } from 'lodash-es';
import { isNilOrError, isPage, endsWith, isDesktop } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import clHistory from 'utils/cl-router/history';
import moment from 'moment';
import 'moment-timezone';
import 'intersection-observer';
import 'focus-visible';
import smoothscroll from 'smoothscroll-polyfill';
import { configureScope } from '@sentry/browser';
import GlobalStyle from 'global-styles';

// constants
import { appLocalesMomentPairs, locales } from 'containers/App/constants';

// context
import { PreviousPathnameContext } from 'context';

// analytics
const ConsentManager = lazy(() => import('components/ConsentManager'));
import { trackPage } from 'utils/analytics';

// components
import Meta from './Meta';
import MainHeader from 'containers/MainHeader';
import MobileNavbar from 'containers/MobileNavbar';
const PlatformFooter = lazy(() => import('containers/PlatformFooter'));
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import LoadableModal from 'components/Loadable/Modal';
import LoadableUserDeleted from 'components/UserDeletedModalContent/LoadableUserDeleted';
import ErrorBoundary from 'components/ErrorBoundary';
import SignUpInModal from 'components/SignUpIn/SignUpInModal';

import Outlet from 'components/Outlet';

import { LiveAnnouncer } from 'react-aria-live';
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
} from 'services/appConfiguration';

// resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

// events
import eventEmitter from 'utils/eventEmitter';
import { openSignUpInModal$ } from 'components/SignUpIn/events';

// style
import styled, { ThemeProvider } from 'styled-components';
import { media, getTheme } from 'utils/styleUtils';

// typings
import { Locale } from 'typings';

// utils
import openVerificationModalIfSuccessOrError from './openVerificationModalIfSuccessOrError';
import openSignUpInModalIfNecessary from './openSignUpInModalIfNecessary';

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
  windowSize: GetWindowSizeChildProps;
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
  invitationDeclined: boolean;
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
      invitationDeclined: false,
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

      openSignUpInModal$.subscribe(({ eventValue: metaData }) => {
        // Sometimes we need to still open the sign up/in modal
        // after login is completed, if registration is not complete.
        // But in that case, componentDidUpdate is somehow called before
        // the modal is closed which overwrites the metaData.
        // This slightly dirty hack covers that case.
        if (metaData) return;

        setTimeout(() => {
          this.forceUpdate();
        }, 1);
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
    const { invitationDeclined } = this.state;

    openSignUpInModalIfNecessary(
      authUser,
      isAuthError,
      isInvitation && !invitationDeclined,
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
      openVerificationModalIfSuccessOrError(search);
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

  handleModalMounted = (id: string) => {
    if (id === 'verification') {
      this.setState({ verificationModalMounted: true });
    }
  };

  handleSignUpInModalMounted = () => {
    this.setState({ signUpInModalMounted: true });
  };

  handleDeclineInvitation = () => {
    this.setState({ invitationDeclined: true });
  };

  render() {
    const { location, children, windowSize } = this.props;
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
    const isDesktopUser = windowSize && isDesktop(windowSize);
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
                    <SignUpInModal
                      onMounted={this.handleSignUpInModalMounted}
                      onDeclineInvitation={this.handleDeclineInvitation}
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
                    <Suspense fallback={null}>
                      <PlatformFooter />
                    </Suspense>
                  )}
                  {showMobileNav && (
                    <MobileNavbar setRef={this.setMobileNavigationRef} />
                  )}
                  <ErrorBoundary>
                    <div id="mobile-nav-portal" />
                  </ErrorBoundary>
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
  windowSize: <GetWindowSize />,
  redirectsEnabled: <GetFeatureFlag name="redirects" />,
});

const AppWithHoC = withRouter(App);

export default (inputProps: InputProps) => (
  <Data>{(dataProps) => <AppWithHoC {...dataProps} {...inputProps} />}</Data>
);
