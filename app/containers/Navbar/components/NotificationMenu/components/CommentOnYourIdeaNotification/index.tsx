import * as React from 'react';
import * as Rx from 'rxjs/Rx';

import { INotificationData } from 'services/notifications';
import { ideaByIdStream } from 'services/ideas';

import messages from '../../messages';

import { FormattedMessage } from 'react-intl';
import NotificationWrapper from '../NotificationWrapper';
import { Link } from 'react-router';

type Props = {
  notification: INotificationData;
};

type State = {
  ideaSlug?: string,
};

export default class CommentOnYourIdeaNotification extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
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

  render() {
    const { notification } = this.props;
    const { ideaSlug } = this.state;

    return (
      <NotificationWrapper
        linkTo={`/ideas/${ideaSlug}`}
        timing={notification.attributes.created_at}
        icon="notification_comment"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...messages.userCommentedOnYourIdea}
          values={{
            name:
            <Link
              to={`/profile/${notification.attributes.user_slug}`}
              onClick={(event) => event.stopPropagation()}
            >
              {notification.attributes.user_first_name}
            </Link>,
          }}
        />
      </NotificationWrapper>
    );
  }
}
