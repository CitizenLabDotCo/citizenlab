import * as React from 'react';

import { IStatusChangeOfYourIdeaNotificationData } from 'services/notifications';
import { IIdeaData } from 'services/ideas';
import { IIdeaStatusData } from 'services/ideaStatuses';
import GetIdea from 'utils/resourceLoaders/components/GetIdea';
import GetIdeaStatus from 'utils/resourceLoaders/components/GetIdeaStatus';

import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

import NotificationWrapper from '../NotificationWrapper';

interface InputProps {
  notification: IStatusChangeOfYourIdeaNotificationData;
}

interface Props extends InputProps {
  idea: IIdeaData | null;
  ideaStatus: IIdeaStatusData | null;
}

interface State {
}

class StatusChangeOfYourIdeaNotification extends React.PureComponent<Props, State> {

  render() {
    const { notification, idea, ideaStatus } = this.props;

    if (!idea || !ideaStatus) return null;

    return (
      <NotificationWrapper
        linkTo={`/ideas/${idea.attributes.slug}`}
        timing={notification.attributes.created_at}
        icon="notification_status"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...messages.statusChangedOfYourIdea}
          values={{
            status: <T value={ideaStatus.attributes.title_multiloc} />,
            ideaTitle: <T value={idea.attributes.title_multiloc} />
          }}
        />
      </NotificationWrapper>
    );
  }
}

export default (props: InputProps) => {
  const { notification } = props;

  if (!notification.relationships.idea.data) return null;

  return (
    <GetIdea id={notification.relationships.idea.data.id}>
      {({ idea }) => {
        if (!notification.relationships.idea_status.data) return null;

        return (
          <GetIdeaStatus id={notification.relationships.idea_status.data.id}>
            {({ ideaStatus }) => (
              <StatusChangeOfYourIdeaNotification
                notification={notification}
                idea={idea}
                ideaStatus={ideaStatus}
              />
            )}
          </GetIdeaStatus>
        );
      }}
    </GetIdea>
  );
};
