import React, { useState, useRef } from 'react';

// components
import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { Popup } from 'semantic-ui-react';
import Notifications from 'containers/MainHeader/NotificationMenu/components/Notifications';
import { NewNotificationsIndicator } from 'containers/MainHeader/NotificationMenu/components/NotificationCount';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import { StyledBox } from './styles';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAuthUser from 'hooks/useAuthUser';

export const NotificationsPopup = () => {
  const { formatMessage } = useIntl();
  const iconDivRef = useRef<HTMLDivElement | null>(null);
  const authUser = useAuthUser();
  const [isNotificationsPopupOpen, setIsNotificationsPopupOpen] =
    useState(false);

  if (isNilOrError(authUser)) {
    return null;
  }

  const unreadNotificationsCount = authUser.attributes.unread_notifications;

  return (
    <Popup
      trigger={
        <StyledBox
          as="button"
          width="100%"
          display="flex"
          justifyContent="flex-start"
          onClick={() => setIsNotificationsPopupOpen(!isNotificationsPopupOpen)}
        >
          <Box display="flex" alignItems="center" w="100%" pr="6px">
            <Box
              display="flex"
              flex="0 0 auto"
              w="45px"
              h="45px"
              alignItems="center"
              justifyContent="center"
            >
              {unreadNotificationsCount > 0 && (
                <Box position="relative">
                  <Box position="absolute" top="-22px" left="10px">
                    <NewNotificationsIndicator>
                      {unreadNotificationsCount}
                    </NewNotificationsIndicator>
                  </Box>
                </Box>
              )}
              <Icon name="notification" fill={colors.green400} />
            </Box>

            <Box display="flex" flex="1" flexDirection="column" opacity={0.7}>
              <Text color="white" ml="10px" fontSize="base" textAlign="left">
                {formatMessage({ ...messages.notifications })}
              </Text>
            </Box>
            <Box ref={iconDivRef} />
          </Box>
        </StyledBox>
      }
      open={isNotificationsPopupOpen}
      onClose={() => setIsNotificationsPopupOpen(false)}
      on="click"
      position="top right"
      context={iconDivRef}
      positionFixed
      offset={[0, -60]}
      basic
      wide
    >
      <Box
        minHeight="200px"
        minWidth="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Notifications />
      </Box>
    </Popup>
  );
};

export default NotificationsPopup;
