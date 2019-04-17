import React from 'react';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

import { IOfficialFeedbackOnYourIdeaNotificationData } from 'services/notifications';
import { ideaByIdStream } from 'services/ideas';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';
import T from 'components/T';

type Props = {
  notification: IOfficialFeedbackOnYourIdeaNotificationData;
};

type State = {
  ideaSlug?: string,
};

export default class OfficialFeedbackOnYourIdeaNotification extends React.PureComponent<Props, State> {
  subscriptions = [] as Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      ideaSlug: undefined,
    };
  }

  componentDidMount() {
    if (this.props.notification.relationships.idea.data) {
      const idea$ = ideaByIdStream(this.props.notification.relationships.idea.data.id).observable;
      this.subscriptions = [
        idea$.subscribe((response) => {
          this.setState({
            ideaSlug: response.data.attributes.slug,
          });
        })
      ];
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onClickUserName = (event) => {
    event.stopPropagation();
  }

  render() {
    const { notification } = this.props;
    const { ideaSlug } = this.state;
    const deletedUser = isNilOrError(notification.attributes.initiating_user_first_name);
    const officialFeedbackAuthorMultiloc = notification.attributes.official_feedback_author;

    return (
      <NotificationWrapper
        linkTo={`/ideas/${ideaSlug}`}
        timing={notification.attributes.created_at}
        icon="notification_comment"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...messages.officialFeedbackOnYourIdea}
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
            </Link>,
            idea: <Link
              to={`/ideas/${ideaSlug}`}
            >
              <T value={notification.attributes.idea_title} />
            </Link>
          }}
        />
      </NotificationWrapper>
    );
  }
}
