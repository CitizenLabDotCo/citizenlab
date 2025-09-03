import React, { lazy, Suspense, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useMarkAllAsRead from 'api/notifications/useMarkAllAsRead';

import { trackEventByName } from 'utils/analytics';

import NotificationCount from './components/NotificationCount';
import tracks from './tracks';

const NotificationsDropdown = lazy(() => import('./NotificationsDropdown'));

const NotificationMenu = () => {
  const { mutate: markAllAsRead } = useMarkAllAsRead();
  const [dropdownOpened, setDropdownOpened] = useState(false);

  const toggleDropdown = () => {
    if (!dropdownOpened) {
      trackEventByName(tracks.clickOpenNotifications);
    } else {
      markAllAsRead();
      trackEventByName(tracks.clickCloseNotifications);
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
