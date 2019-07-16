import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { IStatusChangeOnVotedIdeaNotificationData } from 'services/notifications';
import { adopt } from 'react-adopt';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetIdeaStatus, { GetIdeaStatusChildProps } from 'resources/GetIdeaStatus';
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';
import { get } from 'lodash-es';

interface InputProps {
  notification: IStatusChangeOnVotedIdeaNotificationData;
}

interface DataProps {
  idea: GetIdeaChildProps;
  ideaStatus: GetIdeaStatusChildProps;
}

interface Props extends InputProps, DataProps {}

const StatusChangeOnVotedIdeaNotification = memo<Props>(props => {
  const { notification, idea, ideaStatus } = props;

  if (isNilOrError(idea) || isNilOrError(ideaStatus)) return null;

  return (
    <NotificationWrapper
      linkTo={`/ideas/${idea.attributes.slug}`}
      timing={notification.attributes.created_at}
      icon="notification_status"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.statusChangeOnVotedIdea}
        values={{
          status: <T value={ideaStatus.attributes.title_multiloc} />
        }}
      />
    </NotificationWrapper>
  );
});

const Data = adopt<DataProps, { ideaId: string }>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaStatus: ({ render, idea }) => <GetIdeaStatus id={get(idea, 'relationships.idea_status.data.id')}>{render}</GetIdeaStatus>,
});

export default (inputProps: InputProps) => {
  const ideaId: string | null = get(inputProps, 'notification.relationships.idea.data.id', null);

  if (ideaId === null) return null;

  return (
    <Data ideaId={ideaId}>
      {dataProps => <StatusChangeOnVotedIdeaNotification {...inputProps} {...dataProps} />}
    </Data>
  );
};
