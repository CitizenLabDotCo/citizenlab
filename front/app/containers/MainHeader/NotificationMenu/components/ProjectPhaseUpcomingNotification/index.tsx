import React, { memo } from 'react';
import { FormattedDate } from 'react-intl';
import { IProjectPhaseUpcomingNotificationData } from 'services/notifications';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
// i18n
import messages from '../../messages';
// components
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IProjectPhaseUpcomingNotificationData;
}

const ProjectPhaseUpcomingNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/projects/${notification.attributes.project_slug}`}
      timing={notification.attributes.created_at}
      icon="timeline"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.projectPhaseUpcoming}
        values={{
          projectTitle: (
            <T value={notification.attributes.project_title_multiloc} />
          ),
          phaseStartAt: (
            <FormattedDate value={notification.attributes.phase_start_at} />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default ProjectPhaseUpcomingNotification;
