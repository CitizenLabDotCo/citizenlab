import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import {
  TNotificationData,
  TNotificationType,
  INLPFlagNotificationData,
} from 'api/notifications/types';
import useFeatureFlag from 'hooks/useFeatureFlag';

const Setting = React.lazy(() => import('./admin/containers/Setting'));
const RemoveFlagButton = React.lazy(
  () => import('./admin/components/RemoveFlagButton')
);
const ActivityWarningsTab = React.lazy(
  () => import('./admin/components/ActivityWarningsTab')
);
const InappropriateContentWarning = React.lazy(
  () => import('./admin/components/InappropriateContentWarning')
);
const EmptyMessageModerationsWithFlag = React.lazy(
  () => import('./admin/components/EmptyMessageModerationsWithFlag')
);
const NLPFlagNotification = React.lazy(
  () => import('./citizen/components/NLPFlagNotification')
);

interface RenderOnSelectedTabValueProps {
  isTabSelected: boolean;
  children: ReactNode;
}

interface RenderOnFeatureFlagProps {
  children: ReactNode;
}

interface RenderOnAllowedProps {
  children: ReactNode;
}

const RenderOnSelectedTabValue = ({
  isTabSelected,
  children,
}: RenderOnSelectedTabValueProps) => {
  if (!isTabSelected) return null;
  return <>{children}</>;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const featureFlag = useFeatureFlag({
    name: 'flag_inappropriate_content',
  });

  return featureFlag ? <>{children}</> : null;
};

const RenderOnAllowed = ({ children }: RenderOnAllowedProps) => {
  const allowed = useFeatureFlag({
    name: 'flag_inappropriate_content',
    onlyCheckAllowed: true,
  });

  return allowed ? <>{children}</> : null;
};

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

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.general.form': (props) => {
      return (
        <RenderOnAllowed>
          <Setting {...props} />
        </RenderOnAllowed>
      );
    },
    'app.modules.commercial.moderation.admin.containers.actionbar.buttons': ({
      isWarningsTabSelected,
      ...otherProps
    }) => {
      return (
        <RenderOnSelectedTabValue isTabSelected={isWarningsTabSelected}>
          <RemoveFlagButton {...otherProps} />
        </RenderOnSelectedTabValue>
      );
    },
    'app.modules.commercial.moderation.admin.components.EmptyMessage': ({
      isWarningsTabSelected,
    }) => {
      return (
        <RenderOnSelectedTabValue isTabSelected={isWarningsTabSelected}>
          <EmptyMessageModerationsWithFlag />
        </RenderOnSelectedTabValue>
      );
    },
    'app.modules.commercial.moderation.admin.containers.ModerationRow.content':
      ({ inappropriateContentFlagId }) => {
        if (inappropriateContentFlagId) {
          return (
            <InappropriateContentWarning
              inappropriateContentFlagId={inappropriateContentFlagId}
            />
          );
        }

        return null;
      },
    'app.modules.commercial.moderation.admin.containers.tabs': (props) => {
      return <ActivityWarningsTab {...props} />;
    },
    'app.components.NotificationMenu.Notification': ({ notification }) => (
      <RenderOnFeatureFlag>
        <RenderOnNotificationType
          notification={notification}
          notificationType="inappropriate_content_flagged"
        >
          <NLPFlagNotification
            notification={notification as INLPFlagNotificationData}
          />
        </RenderOnNotificationType>
      </RenderOnFeatureFlag>
    ),
  },
};

export default configuration;
