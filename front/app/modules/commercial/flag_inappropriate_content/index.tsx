import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import RenderOnNotificationType from 'modules/utilComponents/RenderOnNotificationType';
import Setting from './admin/containers/Setting';
import RemoveFlagButton from './admin/components/RemoveFlagButton';
import ActivityWarningsTab from './admin/components/ActivityWarningsTab';
import InappropriateContentWarning from './admin/components/InappropriateContentWarning';
import EmptyMessageModerationsWithFlag from './admin/components/EmptyMessageModerationsWithFlag';
import NLPFlagNotification from './citizen/components/NLPFlagNotification';
import { INLPFlagNotificationData } from 'services/notifications';
import useFeatureFlag from 'hooks/useFeatureFlag';

type RenderOnSelectedTabValueProps = {
  isTabSelected: boolean;
  children: ReactNode;
};

const RenderOnSelectedTabValue = ({
  isTabSelected,
  children,
}: RenderOnSelectedTabValueProps) => {
  if (!isTabSelected) return null;
  return <>{children}</>;
};

const RenderOnFeatureFlag = ({ children }) => {
  const featureFlag = useFeatureFlag({
    name: 'flag_inappropriate_content',
  });

  return featureFlag ? <>{children}</> : null;
};

const RenderOnAllowed = ({ children }) => {
  const allowed = useFeatureFlag({
    name: 'flag_inappropriate_content',
    onlyCheckAllowed: true,
  });

  return allowed ? <>{children}</> : null;
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
      return (
        <RenderOnFeatureFlag>
          <ActivityWarningsTab {...props} />
        </RenderOnFeatureFlag>
      );
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
