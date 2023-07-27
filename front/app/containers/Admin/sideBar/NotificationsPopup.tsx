import React, { useState, useRef } from 'react';

// components
import {
  Box,
  Icon,
  Text,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
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
import useAuthUser from 'api/me/useAuthUser';
import useMarkAllAsRead from 'api/notifications/useMarkAllAsRead';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/MainHeader/NotificationMenu/tracks';

export const NotificationsPopup = () => {
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('tablet');
  const { data: authUser } = useAuthUser();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const iconDivRef = useRef<HTMLDivElement | null>(null);
  const [isNotificationsPopupOpen, setIsNotificationsPopupOpen] =
    useState(false);

  if (isNilOrError(authUser)) {
    return null;
  }

  const unreadNotificationsCount =
    authUser.data.attributes.unread_notifications;

  const handleCloseNotifications = () => {
    markAllAsRead();
    trackEventByName(tracks.clickCloseNotifications.name);
    setIsNotificationsPopupOpen(false);
  };

  const handleOpenNotifications = () => {
    trackEventByName(tracks.clickOpenNotifications.name);
  };

  return (
    <Popup
      trigger={
        <StyledBox
          as="button"
          width={isSmallerThanPhone ? '56px' : '100%'}
          display="flex"
          justifyContent="flex-start"
          onClick={() => setIsNotificationsPopupOpen(true)}
          p="0px"
        >
          <Box
            display="flex"
            alignItems="center"
            w="100%"
            p={isSmallerThanPhone ? '10px 0' : '10px 16px'}
            justifyContent={isSmallerThanPhone ? 'center' : undefined}
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
            {!isSmallerThanPhone && (
              <>
                <Text
                  color="white"
                  ml="15px"
                  fontSize="base"
                  textAlign="left"
                  my="0px"
                  w="100%"
                >
                  {formatMessage({ ...messages.notifications })}
                </Text>
              </>
            )}
            <Box
              w="auto"
              h={isSmallerThanPhone ? '0' : '18px'}
              ref={iconDivRef}
            >
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
      on="click"
      open={isNotificationsPopupOpen}
      onClose={handleCloseNotifications}
      onOpen={handleOpenNotifications}
      position="right center"
      offset={[-40, 0]}
      context={iconDivRef}
      positionFixed
      basic
      wide
    >
      <Box
        minHeight="200px"
        height="250px"
        minWidth="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflowY="auto"
        zIndex="10000"
      >
        <Notifications />
      </Box>
    </Popup>
  );
};

export default NotificationsPopup;
