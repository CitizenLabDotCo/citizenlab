import React from 'react';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';

// components
import { IconButton, Box } from '@citizenlab/cl2-component-library';

// style
import styled, { useTheme } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

const Container = styled.div`
  position: relative;
`;

export const NewNotificationsIndicator = styled.div`
  color: #fff;
  font-size: ${fontSizes.xs}px;
  line-height: ${fontSizes.xs}px;
  background: ${({ theme }) =>
    theme.invertedNavbarColors && theme.navbarTextColor
      ? theme.colors.tenantText
      : colors.error};
  padding: 4px;
  border-radius: ${(props) => props.theme.borderRadius};
  border: solid 1px
    ${({ theme }) =>
      theme.invertedNavbarColors && theme.navbarBackgroundColor
        ? theme.navbarBackgroundColor
        : '#fff'};
  min-width: 18px;
  min-height: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type Props = {
  onClick: () => void;
  dropdownOpened: boolean;
};

const NotificationCount = ({ dropdownOpened, onClick }: Props) => {
  const authUser = useAuthUser();
  const theme = useTheme();
  const { formatMessage } = useIntl();

  if (!isNilOrError(authUser)) {
    const unreadNotificationsCount = authUser.attributes.unread_notifications;

    return (
      <Container>
        <IconButton
          onClick={onClick}
          iconName="notification"
          a11y_buttonActionMessage={formatMessage(
            messages.a11y_notificationsLabel,
            { count: unreadNotificationsCount }
          )}
          iconColor={theme.navbarTextColor || colors.textSecondary}
          iconColorOnHover={
            theme.navbarTextColor
              ? darken(0.2, theme.navbarTextColor)
              : colors.textPrimary
          }
          ariaExpanded={dropdownOpened}
          ariaControls="notifications-dropdown"
        />
        {unreadNotificationsCount > 0 ? (
          <Box position="absolute" top="-9px" left="15px">
            <NewNotificationsIndicator>
              {unreadNotificationsCount}
            </NewNotificationsIndicator>
          </Box>
        ) : null}
      </Container>
    );
  }

  return null;
};

export default NotificationCount;
