import * as React from 'react';
import * as Rx from 'rxjs/Rx';

import { IMentionInCommentNotificationData } from 'services/notifications';
import { ideaByIdStream } from 'services/ideas';

import messages from '../../messages';

import { FormattedMessage } from 'utils/cl-intl';
import NotificationWrapper from '../NotificationWrapper';
import { Link } from 'react-router';

type Props = {
  notification: IMentionInCommentNotificationData;
};

type State = {
  ideaSlug?: string,
};

export default class MentionInCommentNotification extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      ideaSlug: undefined,
    };
  }

  componentWillMount() {
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

    return (
      <NotificationWrapper
        linkTo={`/ideas/${ideaSlug}`}
        timing={notification.attributes.created_at}
        icon="notification_mention"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...messages.mentionInComment}
          values={{
            name:
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
