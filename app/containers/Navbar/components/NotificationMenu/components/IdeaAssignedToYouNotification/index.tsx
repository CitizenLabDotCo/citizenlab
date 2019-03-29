import React from 'react';
import { IIdeaAssignedToYouNotificationData } from 'services/notifications';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import T from 'components/T';

type Props = {
  notification: IIdeaAssignedToYouNotificationData;
};

type State = {};

export default class IdeaAssignedToYouNotification extends React.PureComponent<Props, State> {

  onClickUserName = (event) => {
    event.stopPropagation();
  }

  render() {
    const { notification } = this.props;

    return (
      <NotificationWrapper
        linkTo={`/ideas/${notification.attributes.idea_slug}`}
        timing={notification.attributes.created_at}
        icon="admin"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...messages.ideaAssignedToYou}
          values={{
            ideaTitle: <T value={notification.attributes.idea_title_multiloc} />
          }}
        />
      </NotificationWrapper>
    );
  }
}
