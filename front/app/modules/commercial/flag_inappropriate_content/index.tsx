import React, { ReactNode } from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import RenderOnNotificationType from 'modules/utilComponents/RenderOnNotificationType';
import FeatureFlag from 'components/FeatureFlag';
import Setting from './admin/containers/Setting';
import RemoveFlagButton from './admin/components/RemoveFlagButton';
import ActivityWarningsTab from './admin/components/ActivityWarningsTab';
import InappropriateContentWarning from './admin/components/InappropriateContentWarning';
import EmptyMessageModerationsWithFlag from './admin/components/EmptyMessageModerationsWithFlag';
import NLPFlagNotification from './citizen/components/NLPFlagNotification';
import { INLPFlagNotificationData } from 'services/notifications';

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

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.general.form': (props) => (
      <FeatureFlag onlyCheckAllowed name="flag_inappropriate_content">
        <Setting {...props} />
      </FeatureFlag>
    ),
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
        <FeatureFlag name="flag_inappropriate_content">
          <ActivityWarningsTab {...props} />
        </FeatureFlag>
      );
    },
    'app.components.NotificationMenu.Notification': ({ notification }) => (
      <FeatureFlag name="flag_inappropriate_content">
        <RenderOnNotificationType
          notification={notification}
          notificationType="inappropriate_content_flagged"
        >
          <NLPFlagNotification
            notification={notification as INLPFlagNotificationData}
          />
        </RenderOnNotificationType>
      </FeatureFlag>
    ),
  },
};

export default configuration;
