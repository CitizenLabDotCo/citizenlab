import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

import { IOfficialFeedbackOnVotedIdeaNotificationData } from 'services/notifications';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import T from 'components/T';

interface InputProps {
  notification: IOfficialFeedbackOnVotedIdeaNotificationData;
}
interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

const OfficialFeedbackOnVotedIdeaNotification = memo<Props>(props => {
  const { notification, idea } = props;

  if (isNilOrError(idea)) return null;

  const { slug } = idea.attributes;

  const officialFeedbackAuthorMultiloc = notification.attributes.official_feedback_author;

  return (
    <NotificationWrapper
      linkTo={`/ideas/${slug}`}
      timing={notification.attributes.created_at}
      icon="notification_comment"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.officialFeedbackOnVotedIdea}
        values={{
          officialName: <T value={officialFeedbackAuthorMultiloc} />
        }}
      />
    </NotificationWrapper>
  );
});

export default (inputProps: InputProps) => {
  const { notification } = inputProps;

  if (!notification.relationships.idea.data) return null;

  return (
    <GetIdea id={notification.relationships.idea.data.id}>
      {idea => <OfficialFeedbackOnVotedIdeaNotification notification={notification} idea={idea} />}
    </GetIdea>
  );
};
