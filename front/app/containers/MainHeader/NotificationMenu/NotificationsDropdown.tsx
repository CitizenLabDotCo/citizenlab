import React from 'react';
import Notifications from './components/Notifications';
import { Dropdown } from '@citizenlab/cl2-component-library';

interface Props {
  dropdownOpened: boolean;
  onClickOutside: () => void;
}

const NotificationsDropdown = ({ onClickOutside, dropdownOpened }: Props) => {
  return (
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
  );
};

export default NotificationsDropdown;
