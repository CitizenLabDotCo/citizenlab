import React from 'react';
import { ModuleConfiguration } from 'utils/moduleUtils';
import {
  RenderOnNotificationType,
  RenderOnFeatureFlag,
} from 'modules/utilComponents';
import Setting from './admin/containers/Setting';
import RemoveFlagButton from './admin/components/RemoveFlagButton';
import ActivityTab from './admin/components/ActivityTab';
import InappropriateContentWarning from './admin/components/InappropriateContentWarning';
import NLPFlagNotification from './citizen/components/NLPFlagNotification';
import { INLPFlagNotificationData } from 'services/notifications';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.containers.Admin.settings.general.form': (props) => (
      <RenderOnFeatureFlag featureFlagName="flag_inappropriate_content">
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
      <RenderOnFeatureFlag featureFlagName="flag_inappropriate_content">
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
