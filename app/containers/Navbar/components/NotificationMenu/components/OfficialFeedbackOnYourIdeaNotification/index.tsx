import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

import { IOfficialFeedbackOnYourIdeaNotificationData } from 'services/notifications';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import T from 'components/T';

interface InputProps {
  notification: IOfficialFeedbackOnYourIdeaNotificationData;
}
interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

const OfficialFeedbackOnYourIdeaNotification = memo<Props>(props => {
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
        {...messages.officialFeedbackOnYourIdea}
        values={{
          officialName: <T value={officialFeedbackAuthorMultiloc} />,
          idea: <Link
            to={`/ideas/${slug}`}
          >
            <T value={notification.attributes.idea_title} />
          </Link>
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
      {idea => <OfficialFeedbackOnYourIdeaNotification notification={notification} idea={idea} />}
    </GetIdea>
  );
};
