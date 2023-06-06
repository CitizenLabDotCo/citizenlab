import React, { useState } from 'react';

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
import useAuthUser from 'hooks/useAuthUser';
import useMarkAllAsRead from 'api/notifications/useMarkAllAsRead';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/MainHeader/NotificationMenu/tracks';

export const NotificationsPopup = () => {
  const { formatMessage } = useIntl();
  const isSmallerThanPhone = useBreakpoint('tablet');
  const authUser = useAuthUser();
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const [isNotificationsPopupOpen, setIsNotificationsPopupOpen] =
    useState(false);

  if (isNilOrError(authUser)) {
    return null;
  }

  const unreadNotificationsCount = authUser.attributes.unread_notifications;

  const handleCloseNotifications = () => {
    markAllAsRead();
    trackEventByName(tracks.clickCloseNotifications.name);
    setIsNotificationsPopupOpen(false);
    console.log('Closed and marking as read');
  };

  const handleOpenNotifications = () => {
    trackEventByName(tracks.clickOpenNotifications.name);
    console.log('Opened notifications');
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
            p={isSmallerThanPhone ? '10px 0' : '10px 8px 10px 16px'}
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
              w={isSmallerThanPhone ? '0px' : '16px'}
              h={isSmallerThanPhone ? '0px' : '18px'}
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
          <Box display="flex" alignSelf="flex-end" />
        </StyledBox>
      }
      on="click"
      position="right center"
      open={isNotificationsPopupOpen}
      onClose={handleCloseNotifications}
      onOpen={handleOpenNotifications}
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
