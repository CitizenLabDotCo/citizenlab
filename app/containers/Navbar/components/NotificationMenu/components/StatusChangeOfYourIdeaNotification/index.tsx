import React from 'react';
import { IStatusChangeOfYourIdeaNotificationData } from 'services/notifications';
import { adopt } from 'react-adopt';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetIdeaStatus, { GetIdeaStatusChildProps } from 'resources/GetIdeaStatus';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';
import { get } from 'lodash';

interface InputProps {
  notification: IStatusChangeOfYourIdeaNotificationData;
}

interface DataProps {
  idea: GetIdeaChildProps;
  ideaStatus: GetIdeaStatusChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

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

const Data = adopt<DataProps, { ideaId: string }>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaStatus: ({ ideaId, render }) => <GetIdeaStatus id={ideaId}>{render}</GetIdeaStatus>,
});

export default (inputProps: InputProps) => {
  const ideaId: string | null = get(inputProps, 'notification.relationships.idea.data.id', null);

  if (ideaId === null) return null;

  return (
    <Data ideaId={ideaId}>
      {dataProps => <StatusChangeOfYourIdeaNotification {...inputProps} {...dataProps} />}
    </Data>
  );
};
