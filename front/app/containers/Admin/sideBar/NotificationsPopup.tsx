import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { Popup } from 'semantic-ui-react';
import Notifications from 'containers/MainHeader/NotificationMenu/components/Notifications';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  setIsOpen: (open: boolean) => void;
  isOpen: boolean;
}

export const NotificationsPopup = ({ setIsOpen, isOpen }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Popup
      trigger={
        <Box
          display="flex"
          justifyContent="space-between"
          width="100%"
          onClick={() => setIsOpen(true)}
        >
          {formatMessage({ ...messages.notifications })}
        </Box>
      }
      open={isOpen}
      onClose={() => setIsOpen(false)}
      on="click"
      position="right center"
      positionFixed
      offset={[0, 30]}
      basic
      wide
    >
      <Box minHeight="200px">
        <Notifications />
      </Box>
    </Popup>
  );
};

export default NotificationsPopup;
