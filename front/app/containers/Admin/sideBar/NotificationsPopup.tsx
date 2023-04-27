import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { Popup } from 'semantic-ui-react';
import Notifications from 'containers/MainHeader/NotificationMenu/components/Notifications';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

export const NotificationsPopup = () => {
  const { formatMessage } = useIntl();

  return (
    <Popup
      trigger={
        <Box display="flex" justifyContent="space-between" width="100%">
          {formatMessage({ ...messages.notifications })}
        </Box>
      }
      on="click"
      position="right center"
      positionFixed
      offset={[0, 30]}
      basic
      wide
    >
      <Notifications />
    </Popup>
  );
};

export default NotificationsPopup;
