import React from 'react';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAuthUser from 'api/me/useAuthUser';

// components
import {
  IconButton,
  colors,
  useBreakpoint,
  media,
  fontSizes,
  isRtl,
} from '@citizenlab/cl2-component-library';
import NotificationMenu from '../../NotificationMenu';
import LanguageSelector from '../../LanguageSelector';
import UserMenu from '../../UserMenu';

// utils
import clHistory from 'utils/cl-router/history';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import bowser from 'bowser';
import { isNilOrError, isPage } from 'utils/helperUtils';

// style
import styled, { useTheme } from 'styled-components';
import { darken } from 'polished';

// intl
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../../../messages';

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

  ${media.phone`
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

    ${media.phone`
        margin-left: 20px;
    `}
    `}
`;

const StyledLanguageSelector = styled(LanguageSelector)`
  padding-left: 20px;

  ${media.phone`
    padding-left: 15px;
  `}

  ${isRtl`
    padding-left: 0px;
    padding-right: 20px;
  ${media.phone`
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

const LogInButton = styled.button`
  height: 100%;
  color: ${({ theme }) => theme.navbarTextColor || theme.colors.tenantText};
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

  ${media.phone`
    padding: 0 15px;
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

const DesktopNavbarContent = () => {
  const { data: appConfiguration } = useAppConfiguration();
  const { data: authUser } = useAuthUser();
  const locale = useLocale();
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const tenantLocales = !isNilOrError(appConfiguration)
    ? appConfiguration.data.attributes.settings.core.locales
    : [];
  const isEmailSettingsPage = isPage('email-settings', location.pathname);

  const isSmallerThanTablet = useBreakpoint('tablet');
  const isDesktopUser = !isSmallerThanTablet;

  const signIn = () => {
    triggerAuthenticationFlow({ flow: 'signin' });
  };

  return (
    <Right className={bowser.msie ? 'ie' : ''}>
      {!isEmailSettingsPage && (
        <>
          {isDesktopUser && (
            <RightItem className="projectSearch">
              <IconButton
                onClick={() => clHistory.push('/projects?focusSearch=true')}
                iconName="search"
                a11y_buttonActionMessage={formatMessage(messages.search)}
                iconColor={theme.navbarTextColor || colors.textSecondary}
                iconColorOnHover={
                  theme.navbarTextColor
                    ? darken(0.2, theme.navbarTextColor)
                    : colors.textPrimary
                }
                iconWidth={'30px'}
                iconHeight={'30px'}
              />
            </RightItem>
          )}

          {isNilOrError(authUser) && (
            <RightItem className="login noLeftMargin">
              <LogInButton id="e2e-navbar-login-menu-item" onClick={signIn}>
                <NavigationItemBorder />
                <NavigationItemText>
                  <FormattedMessage {...messages.logIn} />
                </NavigationItemText>
              </LogInButton>
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
        <RightItem className="noLeftMargin">
          <StyledLanguageSelector />
        </RightItem>
      )}
    </Right>
  );
};

export default DesktopNavbarContent;
