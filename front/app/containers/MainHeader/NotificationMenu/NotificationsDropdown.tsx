import React from 'react';
import Notifications from './components/Notifications';
import { Dropdown, Box } from '@citizenlab/cl2-component-library';

interface Props {
  dropdownOpened: boolean;
  onClickOutside: () => void;
}

const NotificationsDropdown = ({ onClickOutside, dropdownOpened }: Props) => {
  return (
    <Box data-testid="notifications-dropdown">
      <Dropdown
        id="notifications-dropdown"
        width="300px"
        mobileWidth="220px"
        top="42px"
        right="-5px"
        mobileRight="-15px"
        opened={dropdownOpened}
        onClickOutside={onClickOutside}
        content={<Notifications />}
      />
    </Box>
  );
};

export default NotificationsDropdown;
