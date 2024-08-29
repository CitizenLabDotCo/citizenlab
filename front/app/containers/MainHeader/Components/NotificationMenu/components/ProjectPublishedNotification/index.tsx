import React, { memo } from 'react';

import { IProjectPublishedNotificationData } from 'api/notifications/types';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

type Props = {
  notification: IProjectPublishedNotificationData;
};

const ProjectPublishedNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/projects/${notification.attributes.project_slug}`}
      timing={notification.attributes.created_at}
      icon="timeline"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.projectPublished}
        values={{
          projectTitle: (
            <T value={notification.attributes.project_title_multiloc} />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default ProjectPublishedNotification;
