import React from 'react';
import { Subscription } from 'rxjs';
import { isNilOrError } from 'utils/helperUtils';

import { ICommentMarkedAsSpamNotificationData } from 'services/notifications';
import { ideaByIdStream } from 'services/ideas';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Multiloc } from 'typings';

// components
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';

type Props = {
  notification: ICommentMarkedAsSpamNotificationData;
};

type State = {
  ideaSlug?: string,
  ideaTitle?: Multiloc,
};

export default class CommentMarkedAsSpamNotification extends React.PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      ideaSlug: undefined,
      ideaTitle: undefined,
    };
  }

  componentDidMount() {
    if (this.props.notification.relationships.idea.data) {
      const idea$ = ideaByIdStream(this.props.notification.relationships.idea.data.id).observable;
      this.subscriptions = [
        idea$.subscribe((response) => {
          this.setState({
            ideaSlug: response.data.attributes.slug,
            ideaTitle: response.data.attributes.title_multiloc,
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
    const { ideaSlug, ideaTitle } = this.state;
    const deletedUser = isNilOrError(notification.attributes.initiating_user_first_name);

    if (!ideaSlug || !ideaTitle) return null;

    return (
      <NotificationWrapper
        linkTo={`/ideas/${ideaSlug}`}
        timing={notification.attributes.created_at}
        icon="notification_comment"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...messages.userMarkedCommentAsSpam}
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
            ideaTitle: <T value={ideaTitle} />
          }}
        />
      </NotificationWrapper>
    );
  }
}
