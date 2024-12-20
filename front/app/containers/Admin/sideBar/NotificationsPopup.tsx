import React, { useState, useRef } from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  useBreakpoint,
  Dropdown,
} from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useMarkAllAsRead from 'api/notifications/useMarkAllAsRead';

import Notifications from 'containers/MainHeader/Components/NotificationMenu/components/Notifications';
import tracks from 'containers/MainHeader/Components/NotificationMenu/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import { StyledBox } from './styles';

export const NotificationsPopup = () => {
  const { formatMessage } = useIntl();
  const isSmallerThanTablet = useBreakpoint('tablet');
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
    setIsNotificationsPopupOpen(true);
    trackEventByName(tracks.clickOpenNotifications.name);
  };

  return (
    <StyledBox
      as="button"
      width={isSmallerThanTablet ? '56px' : '100%'}
      display="flex"
      justifyContent="flex-start"
      onClick={handleOpenNotifications}
      p="0px"
      position="relative"
    >
      <Box
        display="flex"
        alignItems="center"
        w="100%"
        p={isSmallerThanTablet ? '10px 0' : '10px 16px'}
        justifyContent={isSmallerThanTablet ? 'center' : undefined}
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
        {!isSmallerThanTablet && (
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
        <Box w="auto" h={isSmallerThanTablet ? '0' : '18px'} ref={iconDivRef}>
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
      <Dropdown
        opened={isNotificationsPopupOpen}
        content={<Notifications />}
        onClickOutside={handleCloseNotifications}
        left={isSmallerThanTablet ? '60px' : '200px'}
        mobileLeft="60px"
        top="-160px"
      />
    </StyledBox>
  );
};

export default NotificationsPopup;
