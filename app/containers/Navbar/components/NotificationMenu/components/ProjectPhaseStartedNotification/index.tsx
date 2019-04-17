import React from 'react';
import { IProjectPhaseStartedNotificationData } from 'services/notifications';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import T from 'components/T';

type Props = {
  notification: IProjectPhaseStartedNotificationData;
};

export default class ProjectPhaseStartedNotification extends React.PureComponent<Props> {
  render() {
    const { notification } = this.props;

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
            projectTitle: <T value={notification.attributes.project_title_multiloc} />
          }}
        />
      </NotificationWrapper>
    );
  }
}
