import React, { useState, useRef } from 'react';

// components
import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import { Popup } from 'semantic-ui-react';
import Notifications from 'containers/MainHeader/NotificationMenu/components/Notifications';

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
          p="0px"
        >
          <Box
            display="flex"
            alignItems="center"
            w="100%"
            pr="8px"
            pl="16px"
            py="10px"
          >
            <Box
              display="flex"
              flex="0 0 auto"
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                name="notification-outline"
                fill={colors.blue400}
                width="24px"
              />
            </Box>

            <Box display="flex" flex="1" flexDirection="column">
              <Text
                color="white"
                ml="15px"
                fontSize="base"
                textAlign="left"
                my="0px"
              >
                {formatMessage({ ...messages.notifications })}
              </Text>
            </Box>
            <Box ref={iconDivRef} w="16px" h="18px">
              {unreadNotificationsCount > 0 && (
                <Box
                  background={colors.red500}
                  p="0px 4px"
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  borderRadius="2px"
                >
                  <Text color="white" my="0px" fontSize="xs">
                    {unreadNotificationsCount}
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </StyledBox>
      }
      open={isNotificationsPopupOpen}
      onClose={() => setIsNotificationsPopupOpen(false)}
      on="click"
      position="top right"
      context={iconDivRef}
      positionFixed
      offset={[32, -60]}
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
