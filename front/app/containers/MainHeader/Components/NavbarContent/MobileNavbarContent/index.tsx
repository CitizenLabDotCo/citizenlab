import React from 'react';

import { Box, Button, media, isRtl } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';

import WeglotSwitcher from 'components/WeglotSwitcher';

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

// LanguageSelector spaces itself with a 16px left margin on phone; the Weglot
// switcher sits beside it and needs the same, or the two render flush.
const StyledWeglotSwitcher = styled(WeglotSwitcher)`
  padding-left: 16px;

  ${isRtl`
    padding-left: 0;
    padding-right: 16px;
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
    <nav aria-label={formatMessage(messages.ariaLabel)}>
      <RightContainer>
        {!isEmailSettingsPage && (
          <>
            <NavItem className="noLeftMargin">
              <LanguageSelector />
            </NavItem>
            <NavItem className="noLeftMargin">
              <StyledWeglotSwitcher />
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
