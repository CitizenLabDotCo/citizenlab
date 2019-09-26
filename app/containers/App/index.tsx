import React, { PureComponent, Suspense, lazy } from 'react';
import { Subscription, combineLatest } from 'rxjs';
import { tap, first } from 'rxjs/operators';
import { isString, isObject, uniq } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import 'moment-timezone';
import { configureScope } from '@sentry/browser';
import GlobalStyle from 'global-styles';
import { appLocalesMomentPairs } from 'containers/App/constants';

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
import ForbiddenRoute from 'components/routing/forbiddenRoute';
import LoadableModal from 'components/Loadable/Modal';
import LoadableUserDeleted from 'components/UserDeletedModalContent/LoadableUserDeleted';

// auth
import HasPermission from 'components/HasPermission';

// services
import { localeStream } from 'services/locale';
import { IUser } from 'services/users';
import { authUserStream, signOut, signOutAndDeleteAccountPart2 } from 'services/auth';
import { currentTenantStream, ITenant, ITenantStyle } from 'services/tenant';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled, { ThemeProvider } from 'styled-components';
import { media, getTheme } from 'utils/styleUtils';

// typings
import ErrorBoundary from 'components/ErrorBoundary';

const Container = styled.div`
  background: #fff;
  position: relative;
`;

const InnerContainer = styled.div`
  padding-top: ${props => props.theme.menuHeight}px;
  min-width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${props => props.theme.mobileTopBarHeight}px - 1px);
  `}

  &.citizen {
    ${media.smallerThanMaxTablet`
      padding-top: 0px;
      padding-bottom: ${props => props.theme.mobileMenuHeight}px;
    `}
  }
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
  authUser: IUser | null;
  modalId: string | null;
  modalSlug: string | null;
  modalType: 'idea' | 'initiative' | null;
  visible: boolean;
  userDeletedModalOpened: boolean;
  userActuallyDeleted: boolean;
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
      authUser: null,
      modalId: null,
      modalSlug: null,
      modalType: null,
      visible: true,
      userDeletedModalOpened: false,
      userActuallyDeleted: false
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

      eventEmitter.observeEvent<IOpenPostPageModalEvent>('cardClick').subscribe(({ eventValue }) => {
        const { id, slug, type } = eventValue;
        this.openPostPageModal(id, slug, type);
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
      userActuallyDeleted
    } = this.state;
    const isAdminPage = (location.pathname.startsWith('/admin'));
    const theme = getTheme(tenant);

    return (
      <>
        {tenant && visible && (
          <PreviousPathnameContext.Provider value={previousPathname}>
            <ThemeProvider theme={theme}>
              <>
                <GlobalStyle />

                <Container className={`${isAdminPage ? 'admin' : 'citizen'}`}>
                  <Meta />

                  <ErrorBoundary>
                    <Suspense fallback={null}>
                      <PostPageFullscreenModal
                        type={modalType}
                        id={modalId}
                        slug={modalSlug}
                        close={this.closePostPageModal}
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
                    <div id="modal-portal" />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <Navbar />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <ConsentManager />
                  </ErrorBoundary>

                  <InnerContainer className={`${isAdminPage ? 'admin' : 'citizen'}`}>
                    <HasPermission item={{ type: 'route', path: location.pathname }} action="access">
                      <ErrorBoundary>
                        {children}
                      </ErrorBoundary>
                      <HasPermission.No>
                        <ForbiddenRoute />
                      </HasPermission.No>
                    </HasPermission>
                  </InnerContainer>
                </Container>
              </>
            </ThemeProvider>
          </PreviousPathnameContext.Provider>
        )}
      </>
    );
  }
}

export default withRouter(App);
