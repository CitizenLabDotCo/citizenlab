import React from 'react';
import { IProjectPhaseUpcomingNotificationData } from 'services/notifications';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import T from 'components/T';

type Props = {
  notification: IProjectPhaseUpcomingNotificationData;
};

type State = {};

export default class ProjectPhaseUpcomingNotification extends React.PureComponent<Props, State> {

  onClickUserName = (event) => {
    event.stopPropagation();
  }

  render() {
    const { notification } = this.props;

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
            projectTitle: <T value={notification.attributes.project_title_multiloc} />,
            phaseStartAt: notification.attributes.phase_start_at
          }}
        />
      </NotificationWrapper>
    );
  }
}
