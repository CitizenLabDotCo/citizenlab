import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

// services
import { IMentionInOfficialFeedbackNotificationData } from 'services/notifications';
import { ideaByIdStream } from 'services/ideas';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';

type Props = {
  notification: IMentionInOfficialFeedbackNotificationData;
};

type State = {
  ideaSlug?: string,
};

export default class MentionInCommentNotification extends PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
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

    return (
      <NotificationWrapper
        linkTo={`/ideas/${ideaSlug}`}
        timing={notification.attributes.created_at}
        icon="notification_mention"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...messages.mentionInOfficialFeedback}
          values={{
            name: deletedUser ?
              <DeletedUser>
                <FormattedMessage {...messages.deletedUser} />
              </DeletedUser>
              :
              <Link
                to={`/profile/${notification.attributes.initiating_user_slug}`}
                onClick={this.onClickUserName}
              >
                {notification.attributes.initiating_user_first_name}
              </Link>,
          }}
        />
      </NotificationWrapper>
    );
  }
}
