import React, { ReactNode } from 'react';
import { TNotificationData, TNotificationType } from 'services/notifications';
import { AppConfigurationSettingsFeatureNames } from 'services/appConfiguration';
import useFeatureFlag from 'hooks/useFeatureFlag';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
  featureFlagName: AppConfigurationSettingsFeatureNames;
};

export const RenderOnFeatureFlag = ({
  children,
  featureFlagName,
}: RenderOnFeatureFlagProps) => {
  const isEnabled = useFeatureFlag(featureFlagName);
  if (isEnabled) {
    return <>{children}</>;
  }
  return null;
};

export type RenderOnNotificationTypeProps = {
  children: ReactNode;
  notification: TNotificationData;
  notificationType: TNotificationType;
};

export const RenderOnNotificationType = ({
  children,
  notification,
  notificationType,
}: RenderOnNotificationTypeProps) => {
  if (notification.attributes.type === notificationType) {
    return <>{children}</>;
  }

  return null;
};
