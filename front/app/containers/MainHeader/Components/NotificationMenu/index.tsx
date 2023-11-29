import React, { lazy, Suspense, useState } from 'react';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import NotificationCount from './components/NotificationCount';
const NotificationsDropdown = lazy(() => import('./NotificationsDropdown'));

import { Box } from '@citizenlab/cl2-component-library';
import useMarkAllAsRead from 'api/notifications/useMarkAllAsRead';

const NotificationMenu = () => {
  const { mutate: markAllAsRead } = useMarkAllAsRead();
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

  return (
    <Box position="relative">
      <NotificationCount
        onClick={toggleDropdown}
        dropdownOpened={dropdownOpened}
      />
      <Suspense fallback={null}>
        <NotificationsDropdown
          dropdownOpened={dropdownOpened}
          onClickOutside={toggleDropdown}
        />
      </Suspense>
    </Box>
  );
};

export default NotificationMenu;
