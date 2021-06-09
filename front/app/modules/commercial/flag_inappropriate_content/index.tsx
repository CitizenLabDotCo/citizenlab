import { ModuleConfiguration } from 'utils/moduleUtils';
import { RenderOnNotificationType } from 'modules/utilComponents';
import React, { ReactNode } from 'react';
import Setting from './admin/containers/Setting';
import RemoveFlagButton from './admin/components/RemoveFlagButton';
import ActivityTab from './admin/components/ActivityTab';
import InappropriateContentWarning from './admin/components/InappropriateContentWarning';
import useFeatureFlag from 'hooks/useFeatureFlag';
import NlpFlaggedPostNotification from './citizen/components/NlpFlaggedPostNotification';
import { INlpFlaggedPostNotificationData } from 'services/notifications';

type RenderOnFeatureFlagProps = {
  children: ReactNode;
};

const RenderOnFeatureFlag = ({ children }: RenderOnFeatureFlagProps) => {
  const isEnabled = useFeatureFlag('flag_inappropriate_content');
  if (isEnabled) {
    return <>{children}</>;
  }
  return null;
};

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.general.form': (props) => (
      <RenderOnFeatureFlag>
        <Setting {...props} />
      </RenderOnFeatureFlag>
    ),
    'app.modules.commercial.moderation.admin.containers.actionbar.buttons': (
      props
    ) => {
      return <RemoveFlagButton {...props} />;
    },
    'app.modules.commercial.moderation.admin.containers.ModerationRow.content': ({
      inappropriateContentFlagId,
    }) => {
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
      return <ActivityTab {...props} />;
    },
    'app.components.NotificationMenu.Notification': ({ notification }) => (
      <RenderOnFeatureFlag>
        <RenderOnNotificationType
          notification={notification}
          notificationType="inappropriate_content_flagged"
        >
          <NlpFlaggedPostNotification
            notification={notification as INlpFlaggedPostNotificationData}
          />
        </RenderOnNotificationType>
      </RenderOnFeatureFlag>
    ),
  },
};

export default configuration;
