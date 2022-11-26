import React, { lazy, Suspense, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import NotificationCount from './components/NotificationCount';
const NotificationsDropdown = lazy(() => import('./NotificationsDropdown'));
import { markAllAsRead } from 'services/notifications';
import useAuthUser from 'hooks/useAuthUser';
import { Box } from '@citizenlab/cl2-component-library';

const NotificationMenu = () => {
  const authUser = useAuthUser();
  const [dropdownOpened, setDropdownOpened] = useState(false);

  const toggleDropdown = () => {
    if (!dropdownOpened) {
      trackEventByName(tracks.clickOpenNotifications.name);
    } else {
      markAllAsRead();
      trackEventByName(tracks.clickCloseNotifications.name);
    }

    setDropdownOpened((dropdownOpened) => !dropdownOpened);
  };

  if (!isNilOrError(authUser)) {
    return (
      <Box position="relative">
        <NotificationCount
          count={authUser.attributes.unread_notifications}
          onToggleDropdown={toggleDropdown}
          dropdownOpened={dropdownOpened}
        />
        <Suspense fallback={null}>
          <NotificationsDropdown
            dropdownOpened={dropdownOpened}
            toggleDropdown={toggleDropdown}
          />
        </Suspense>
      </Box>
    );
  }

  return null;
};

export default NotificationMenu;
