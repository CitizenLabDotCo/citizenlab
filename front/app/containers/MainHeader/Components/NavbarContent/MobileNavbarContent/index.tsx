import React from 'react';

import { Box, Button, media, isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError, isPage } from 'utils/helperUtils';

import messages from '../../../messages';
import LanguageSelector from '../../LanguageSelector';
import NotificationMenu from '../../NotificationMenu';
import UserMenu from '../../UserMenu';

import ButtonWithFullMobileNavMenu from './ButtonWithFullMobileNavMenu';

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
  const { data: authUser } = useAuthUser();
  const { formatMessage } = useIntl();

  const isEmailSettingsPage = isPage('email-settings', location.pathname);

  const signIn = () => {
    triggerAuthenticationFlow({}, 'signin');
  };

  return (
    <nav>
      <RightContainer>
        {!isEmailSettingsPage && (
          <>
            <NavItem className="noLeftMargin">
              <LanguageSelector />
            </NavItem>
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
              <ButtonWithFullMobileNavMenu />
            </NavItem>
          </>
        )}
      </RightContainer>
    </nav>
  );
};

export default MobileNavbarContent;
