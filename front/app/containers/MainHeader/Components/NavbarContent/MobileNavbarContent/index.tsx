import React, { Suspense, useRef, useState } from 'react';

import { Box, Button, media, isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

import useLocale from 'hooks/useLocale';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { isNilOrError, isPage } from 'utils/helperUtils';

import messages from '../../../messages';
import tracks from '../../../tracks';
import LanguageSelector from '../../LanguageSelector';
import NotificationMenu from '../../NotificationMenu';
import UserMenu from '../../UserMenu';

import FullMobileNavMenu from './FullMobileNavMenu';
import ShowFullMenuButton from './ShowFullMenuButton';

const RightContainer = styled(Box)`
  display: flex;
  align-items: center;
  height: ${({ theme }) => theme.menuHeight}px;
  margin-right: 30px;

  ${media.desktop`
    margin-right: 40px;
  `}

  ${media.phone`
    margin-right: 20px;
  `}
  ${isRtl`
    flex-direction: row-reverse;
    margin-left: 30px;


    ${media.desktop`
        margin-left: 40px;
    `}

    ${media.phone`
        margin-left: 20px;
    `}
  `}
`;

const NavItem = styled(Box)`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 40px;
  white-space: nowrap;

  &.noLeftMargin {
    margin-left: 0px;
  }

  ${media.phone`
    margin-left: 12px;
  `}

  ${isRtl`
    margin-right: 40px;
    margin-left: 0;
    ${media.phone`
        margin-right: 12px;
    `}
    &.noLeftMargin {
        margin-left: 0;
        margin-right: 0px;
    }
  `}
`;

const MobileNavbarContent = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();
  const locale = useLocale();
  const { formatMessage } = useIntl();

  const isEmailSettingsPage = isPage('email-settings', location.pathname);
  const tenantLocales = !isNilOrError(appConfiguration)
    ? appConfiguration.data.attributes.settings.core.locales
    : [];

  const [isFullMenuOpened, setIsFullMenuOpened] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  const signIn = () => {
    triggerAuthenticationFlow({ flow: 'signin' });
  };

  const onShowMore = (isFullMenuOpened: boolean) => {
    setIsFullMenuOpened((prevIsFullMenuOpened) => !prevIsFullMenuOpened);
    trackEventByName(
      isFullMenuOpened
        ? tracks.moreButtonClickedFullMenuOpened
        : tracks.moreButtonClickedFullMenuClosed
    );
  };

  const onCloseFullMenu = () => {
    setIsFullMenuOpened(false);
  };

  return (
    <nav ref={containerRef}>
      <RightContainer>
        {!isEmailSettingsPage && (
          <>
            {tenantLocales.length > 1 && locale && (
              <NavItem className="noLeftMargin">
                <LanguageSelector />
              </NavItem>
            )}
            {isNilOrError(authUser) ? (
              <NavItem className="login">
                <Button
                  id="e2e-navbar-login-menu-item"
                  onClick={signIn}
                  text={formatMessage(messages.logIn)}
                />
              </NavItem>
            ) : (
              <>
                <NavItem>
                  <NotificationMenu />
                </NavItem>
                <NavItem>
                  <UserMenu />
                </NavItem>
              </>
            )}
            <NavItem>
              <ShowFullMenuButton
                onClick={() => {
                  onShowMore(isFullMenuOpened);
                }}
              />
            </NavItem>
          </>
        )}
      </RightContainer>
      <Suspense fallback={null}>
        {containerRef.current && (
          <FullMobileNavMenu
            isFullMenuOpened={isFullMenuOpened}
            onClose={onCloseFullMenu}
            mobileNavbarRef={containerRef.current}
          />
        )}
      </Suspense>
    </nav>
  );
};

export default MobileNavbarContent;
