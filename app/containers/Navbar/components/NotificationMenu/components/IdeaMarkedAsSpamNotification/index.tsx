import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { Multiloc } from 'typings';

import { IIdeaMarkedAsSpamNotificationData } from 'services/notifications';
import { ideaByIdStream } from 'services/ideas';

import messages from '../../messages';

import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';
import { Link } from 'react-router';


type Props = {
  notification: IIdeaMarkedAsSpamNotificationData;
};

type State = {
  ideaSlug?: string,
  ideaTitle?: Multiloc,
};

export default class IdeaMarkedAsSpamNotification extends React.PureComponent<Props, State> {
  subscriptions: Rx.Subscription[];

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

    if (!ideaSlug || !ideaTitle) return null;

    return (
      <NotificationWrapper
        linkTo={`/ideas/${ideaSlug}`}
        timing={notification.attributes.created_at}
        icon="notification_comment"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...messages.userMarkedIdeaAsSpam}
          values={{
            name:
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
