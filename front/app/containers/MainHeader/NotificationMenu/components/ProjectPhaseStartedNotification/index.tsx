import React, { memo } from 'react';
import { IProjectPhaseStartedNotificationData } from 'services/notifications';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
// i18n
import messages from '../../messages';
// components
import NotificationWrapper from '../NotificationWrapper';

type Props = {
  notification: IProjectPhaseStartedNotificationData;
};

const ProjectPhaseStartedNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/projects/${notification.attributes.project_slug}`}
      timing={notification.attributes.phase_start_at}
      icon="timeline"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.projectPhaseStarted}
        values={{
          projectTitle: (
            <T value={notification.attributes.project_title_multiloc} />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default ProjectPhaseStartedNotification;
