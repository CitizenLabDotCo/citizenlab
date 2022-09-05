import React, { ReactNode } from 'react';
import { TNotificationData, TNotificationType } from 'services/notifications';

export type RenderOnNotificationTypeProps = {
  children: ReactNode;
  notification: TNotificationData;
  notificationType: TNotificationType;
};

const RenderOnNotificationType = ({
  children,
  notification,
  notificationType,
}: RenderOnNotificationTypeProps) => {
  if (notification.attributes.type === notificationType) {
    return <>{children}</>;
  }

  return null;
};

export default RenderOnNotificationType;
