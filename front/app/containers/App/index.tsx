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
import { appLocalesMomentPairs, locales } from 'containers/App/constants';

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

// events
import eventEmitter from 'utils/eventEmitter';

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
                .filter((locale) => locale !== 'en')
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
    const signUpInModalHasMounted =
      !prevState.signUpInModalMounted && signUpInModalMounted;

    if (
      redirectsEnabled &&
      (prevState.tenant !== tenant ||
        prevProps.location.pathname !== this.props.location.pathname)
    ) {
      this.handleCustomRedirect();
    }

    // here we check all the possible conditions that could potentially trigger the sign-up and/or verification flow to appear
    if (
      // when the user is redirected to the '/authentication-error' url (e.g. when SSO fails)
      (signUpInModalHasMounted && isAuthError) ||
      // when the user is sent to the '/invite' url (e.g. when the user clicks on an invitation link)
      (signUpInModalHasMounted && isInvitation) ||
      // when -both- the signup modal component has mounted and the authUser stream has initiated
      // we proceed to the code below to check if any sign-up related url params are present in the url
      (signUpInModalHasMounted && !isNilOrError(authUser)) ||
      (prevState.authUser === undefined &&
        !isNilOrError(authUser) &&
        signUpInModalMounted)
    ) {
      const urlSearchParams = (parse(search, {
        ignoreQueryPrefix: true,
      }) as any) as SSOParams;
      // this constant represents the 'token' param that can optionally be included in the url
      // when a user gets sent to the platform through an invitation link (e.g. '/invite?token=123456)
      const token = urlSearchParams?.['token'] as string | undefined;

      // shouldCompleteRegistration is set to true when the authUser registration_completed_at attribute is not yet set.
      // when this attribute is undefined the sign-up process has not yet been completed and the user account is not yet valid!
      const shouldCompleteRegistration = !authUser?.data?.attributes
        ?.registration_completed_at;

      const shouldConfirm =
        !!authUser?.data?.attributes?.confirmation_required &&
        !!shouldCompleteRegistration;

      // see services/singleSignOn.ts for the typed interface of all the sso related url params the url can potentially contain
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
        // remove all url params from the url as relevant params have already been captured in the code above.
        // this avoids possbile polution by any remaining url params later on in the process.
        window.history.replaceState(null, '', '/');
      }

      // 1. sso_response indicates the user got sent back to the platform from an external sso page (facebook, google, ...)
      // 2. shouldCompleteRegistration indicates the authUser registration_completed_at attribute is noy yer set and the user still needs to complete their registration
      // 3. isInvitation indicates the user got sent to the platform through an invitation link
      if (
        sso_response ||
        shouldCompleteRegistration ||
        isInvitation ||
        shouldConfirm
      ) {
        // if the authUser verified attr is set to false but the sso_verification param is present (= set to the string 'true', not a boolean because it's a url param)
        // the user still needs to complete the verification step
        const shouldVerify =
          !authUser?.data?.attributes?.verified && sso_verification;

        // if the sso_pathname is present we redirect the user to it
        // we do this to sent the user back to the page they came from after
        // having been redirected to an external SSO service (e.g. '/project/123' -> facebook sign-on -> back to '/project/123')
        if (!isAuthError && sso_pathname) {
          clHistory.replace(sso_pathname);
        }

        // we do not open the modal when the user gets sent to the '/sign-up' or '/sign-in' urls because
        // on those pages we show the sign-up-in flow directly on the page and not as a modal.
        // otherwise, when any of the above-defined conditions is set to true, we do trigger the modal
        if (
          !endsWith(sso_pathname, ['sign-up', 'sign-in']) &&
          (isAuthError ||
            (isInvitation && shouldCompleteRegistration) ||
            shouldConfirm ||
            shouldVerify ||
            shouldCompleteRegistration)
        ) {
          openSignUpInModal({
            isInvitation,
            token,
            flow: isAuthError && sso_flow ? sso_flow : 'signup',
            error: isAuthError,
            verification: !!sso_verification,
            requiresConfirmation: shouldConfirm,
            modalNoCloseSteps: ['confirmation'],
            verificationContext:
              sso_verification &&
              sso_verification_action &&
              sso_verification_id &&
              sso_verification_type
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

    // when -both- the authUser is initiated and the evrification modal component mounted
    // we check if a 'verification_success' or 'verification_error' url param is present.
    // if so, we open the verication modal with the appropriate step
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

  handleModalMounted = (id: string) => {
    if (id === 'verification') {
      this.setState({ verificationModalMounted: true });
    }
  };

  handleSignUpInModalMounted = () => {
    this.setState({ signUpInModalMounted: true });
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
                    <Outlet
                      id="app.containers.App.signUpInModal"
                      onMounted={this.handleSignUpInModalMounted}
                    >
                      {(outletComponents) => {
                        return outletComponents.length > 0 ? (
                          <>{outletComponents}</>
                        ) : (
                          <SignUpInModal
                            onMounted={this.handleSignUpInModalMounted}
                          />
                        );
                      }}
                    </Outlet>
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

const AppWithHoC = withRouter(App);

export default (inputProps: InputProps) => (
  <Data>{(dataProps) => <AppWithHoC {...dataProps} {...inputProps} />}</Data>
);
