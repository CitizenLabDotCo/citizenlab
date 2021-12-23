// libraries
import React, { useState, useRef, useEffect } from 'react';
import { includes } from 'lodash-es';
import { locales } from 'containers/App/constants';
import bowser from 'bowser';

// components
import NotificationMenu from './NotificationMenu';
import DesktopNavbar from './DesktopNavbar';
import UserMenu from './UserMenu';
import TenantLogo from './TenantLogo';
import LoadableLanguageSelector from 'components/Loadable/LanguageSelector';
import Fragment from 'components/Fragment';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import { useWindowSize } from '@citizenlab/cl2-component-library';

// utils
import { isNilOrError, isPage, isDesktop } from 'utils/helperUtils';
import { openSignUpInModal } from 'components/SignUpIn/events';
import eventEmitter from 'utils/eventEmitter';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { media, fontSizes, isRtl } from 'utils/styleUtils';

const Container = styled.header<{ position: 'fixed' | 'absolute' }>`
  width: 100vw;
  height: ${({ theme }) => theme.menuHeight}px;
  display: flex;
  align-items: stretch;
  position: ${(props) => props.position};
  top: 0;
  left: 0;
  background: ${({ theme }) => theme.navbarBackgroundColor || '#fff'};
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.1);
  z-index: 1004;

  &.hideNavbar {
    ${media.smallerThanMaxTablet`
      display: none;
    `}
  }

  &.citizenPage {
    ${media.smallerThanMaxTablet`
      position: absolute;
    `}
  }

  @media print {
    display: none;
  }
`;

const ContainerInner = styled.div`
  flex-grow: 1;
  flex-shrink: 0;
  flex-basis: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  position: relative;
  ${isRtl`
    padding-left: 0px;
    padding-right: 20px;
    flex-direction: row-reverse;
    `}

  ${media.smallerThanMinTablet`
    padding-left: 15px;
  `}
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.menuHeight}px;
  ${isRtl`
    flex-direction: row-reverse;
    `}
`;

const NavigationItemBorder = styled.div`
  height: 6px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: 'transparent';
`;

const NavigationItemText = styled.span`
  white-space: nowrap;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.menuHeight}px;
  margin-right: 30px;

  &.ie {
    margin-right: 50px;
  }

  ${media.desktop`
    margin-right: 40px;
  `}

  ${media.smallerThanMinTablet`
    margin-right: 20px;
  `}
  ${isRtl`
    flex-direction: row-reverse;
    margin-left: 30px;

    &.ie {
      margin-left: 50px;
    }
    ${media.desktop`
        margin-left: 40px;
    `}

    ${media.smallerThanMinTablet`
        margin-left: 20px;
    `}
    `}
`;

const StyledLoadableLanguageSelector = styled(LoadableLanguageSelector)`
  padding-left: 20px;

  ${media.smallerThanMinTablet`
    padding-left: 15px;
  `}
  ${isRtl`
    padding-left: 0px;
    padding-right: 20px;
  ${media.smallerThanMinTablet`
    padding-right: 15px;
  `}
  `}
`;

const RightItem = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 40px;
  white-space: nowrap;

  &.noLeftMargin {
    margin-left: 0px;
  }

  ${media.smallerThanMinTablet`
    margin-left: 30px;
  `}

  ${isRtl`
    margin-right: 40px;
    margin-left: 0;
    ${media.smallerThanMinTablet`
        margin-right: 30px;
    `}
    &.noLeftMargin {
        margin-left: 0;
        margin-right: 0px;
    }

  `}
`;

const StyledRightFragment = styled(Fragment)`
  max-width: 200px;
`;

const LogInMenuItem = styled.button`
  height: 100%;
  color: ${({ theme }) => theme.navbarTextColor || theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 500;
  padding: 0 30px;
  border: none;
  border-radius: 0px;
  cursor: pointer;
  transition: all 100ms ease-out;

  &:hover {
    text-decoration: underline;
  }

  ${media.smallerThanMinTablet`
    padding: 0 15px;
  `}
`;

const SignUpMenuItem = styled.button`
  height: 100%;
  color: #fff;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 500;
  padding: 0 30px;
  cursor: pointer;
  border: none;
  border-radius: 0px;
  background-color: ${({ theme }) =>
    theme.navbarHighlightedItemBackgroundColor || theme.colorSecondary};
  transition: all 100ms ease-out;

  &:hover {
    color: #fff;
    text-decoration: underline;
    background-color: ${({ theme }) =>
      darken(
        0.12,
        theme.navbarHighlightedItemBackgroundColor || theme.colorSecondary
      )};
  }

  ${media.smallerThanMinTablet`
    padding: 0 15px;
  `}

  ${media.phone`
    padding: 0 12px;
  `}
`;

interface Props {
  setRef?: (arg: HTMLElement) => void | undefined;
}

const MainHeader = ({ setRef }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appConfiguration = useAppConfiguration();
  const authUser = useAuthUser();
  const locale = useLocale();
  const windowSize = useWindowSize();
  const [fullscreenModalOpened, setFullscreenModalOpened] = useState(false);

  useEffect(() => {
    if (setRef && containerRef.current) {
      setRef(containerRef.current);
    }
  }, [setRef]);

  useEffect(() => {
    const subscriptions = [
      eventEmitter.observeEvent('cardClick').subscribe(() => {
        setFullscreenModalOpened(true);
      }),
      eventEmitter.observeEvent('fullscreenModalClosed').subscribe(() => {
        setFullscreenModalOpened(false);
      }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, []);

  const tenantLocales = !isNilOrError(appConfiguration)
    ? appConfiguration.data.attributes.settings.core.locales
    : [];
  const urlSegments = location.pathname.replace(/^\/+/g, '').split('/');
  const firstUrlSegment = urlSegments[0];
  const secondUrlSegment = urlSegments[1];
  const lastUrlSegment = urlSegments[urlSegments.length - 1];
  const isIdeaPage =
    urlSegments.length === 3 &&
    includes(locales, firstUrlSegment) &&
    secondUrlSegment === 'ideas' &&
    lastUrlSegment !== 'new';
  const isInitiativePage =
    urlSegments.length === 3 &&
    includes(locales, firstUrlSegment) &&
    secondUrlSegment === 'initiatives' &&
    lastUrlSegment !== 'new';
  const isAdminPage = isPage('admin', location.pathname);
  const isEmailSettingsPage = isPage('email-settings', location.pathname);
  const isProjectPage = !!(
    !fullscreenModalOpened &&
    urlSegments.length === 3 &&
    urlSegments[0] === locale &&
    urlSegments[1] === 'projects'
  );
  const isDesktopUser = isDesktop(windowSize.windowWidth);

  const trackSignUpLinkClick = () => {
    trackEventByName(tracks.clickSignUpLink.name);
  };

  const preloadLanguageSelector = () => {
    LoadableLanguageSelector.preload();
  };

  const signIn = () => {
    openSignUpInModal({ flow: 'signin' });
  };

  const signUp = () => {
    openSignUpInModal({ flow: 'signup' });
  };

  return (
    <Container
      id="e2e-navbar"
      className={`${
        isAdminPage ? 'admin' : 'citizenPage'
      } ${'alwaysShowBorder'} ${
        isIdeaPage || isInitiativePage ? 'hideNavbar' : ''
      }`}
      ref={containerRef}
      position={isProjectPage ? 'absolute' : 'fixed'}
    >
      <ContainerInner>
        <Left>
          <TenantLogo />
          {isDesktopUser && <DesktopNavbar />}
        </Left>

        <StyledRightFragment name="navbar-right">
          <Right className={bowser.msie ? 'ie' : ''}>
            {!isEmailSettingsPage && (
              <>
                {isNilOrError(authUser) && (
                  <RightItem className="login noLeftMargin">
                    <LogInMenuItem
                      id="e2e-navbar-login-menu-item"
                      onClick={signIn}
                    >
                      <NavigationItemBorder />
                      <NavigationItemText>
                        <FormattedMessage {...messages.logIn} />
                      </NavigationItemText>
                    </LogInMenuItem>
                  </RightItem>
                )}

                {isNilOrError(authUser) && (
                  <RightItem
                    onClick={trackSignUpLinkClick}
                    className="signup noLeftMargin"
                  >
                    <SignUpMenuItem
                      id="e2e-navbar-signup-menu-item"
                      onClick={signUp}
                    >
                      <NavigationItemText className="sign-up-span">
                        <FormattedMessage {...messages.signUp} />
                      </NavigationItemText>
                    </SignUpMenuItem>
                  </RightItem>
                )}

                {!isNilOrError(authUser) && (
                  <RightItem className="notification">
                    <NotificationMenu />
                  </RightItem>
                )}

                {!isNilOrError(authUser) && (
                  <RightItem className="usermenu">
                    <UserMenu />
                  </RightItem>
                )}
              </>
            )}

            {tenantLocales.length > 1 && locale && (
              <RightItem
                onMouseOver={preloadLanguageSelector}
                className="noLeftMargin"
              >
                <StyledLoadableLanguageSelector />
              </RightItem>
            )}
          </Right>
        </StyledRightFragment>
      </ContainerInner>
    </Container>
  );
};

export default MainHeader;
