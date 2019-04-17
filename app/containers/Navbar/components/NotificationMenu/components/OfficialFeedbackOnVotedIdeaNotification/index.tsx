import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

import { IOfficialFeedbackOnVotedIdeaNotificationData } from 'services/notifications';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';
import T from 'components/T';

interface InputProps {
  notification: IOfficialFeedbackOnVotedIdeaNotificationData;
}
interface DataProps {
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

class OfficialFeedbackOnVotedIdeaNotification extends React.PureComponent<Props> {
  onClickUserName = (event) => {
    event.stopPropagation();
  }

  render() {
    const { notification, idea } = this.props;

    if (isNilOrError(idea)) return null;

    const { slug } = idea.attributes;

    const deletedUser = isNilOrError(notification.attributes.initiating_user_first_name) || isNilOrError(notification.attributes.initiating_user_slug);
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
            officialName: deletedUser ?
            <DeletedUser>
              <FormattedMessage {...messages.deletedUser} />
            </DeletedUser>
            :
            <Link
              to={`/profile/${notification.attributes.initiating_user_slug}`}
              onClick={this.onClickUserName}
            >
              <T value={officialFeedbackAuthorMultiloc} />
            </Link>
          }}
        />
      </NotificationWrapper>
    );
  }
}

export default (inputProps: InputProps) => {
  const { notification } = inputProps;

  if (!notification.relationships.idea.data) return null;

  return (
    <GetIdea id={notification.relationships.idea.data.id}>
      {idea => <OfficialFeedbackOnVotedIdeaNotification notification={notification} idea={idea} />}
    </GetIdea>
  );
};
