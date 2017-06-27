import React from 'react';
import PropTypes from 'prop-types';
import CommentOnCommentNotification from './CommentOnCommentNotification/index';
import CommentOnIdeaNotification from './CommentOnIdeaNotification/index';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from 'styled-components';

class Notifications extends React.PureComponent {
  constructor() {
    super();

    // provide context to bindings
    this.getNotificationComponent = this.getNotificationComponent.bind(this);
  }

  getNotificationComponent(notification, locale) {
    if (notification.attributes.type === 'comment_on_your_comment') {
      return (<CommentOnCommentNotification
        notification={notification}
        locale={locale}
        clearNotification={this.props.markNotificationAsReadRequest}
      />);
    } else if (notification.attributes.type === 'comment_on_your_idea') {
      return (<CommentOnIdeaNotification
        notification={notification}
        locale={locale}
        clearNotification={this.props.markNotificationAsReadRequest}
      />);
    }
  }

  render() {
    const { notifications, locale } = this.props;
    const classRef = this;

    if (notifications.size > 0) {
      return (<span role="button" onClick={(evt) => evt.stopPropagation()}>
        {notifications
        .toJS()
        .sort((n1, n2) => n2.attributes.read_at !== n1.attributes.read_at)
        .map((notification) => <span key={notification.id}>
          {classRef.getNotificationComponent(notification, locale)}
        </span>)}
      </span>);
    }
    return <span />;
  }
}

Notifications.propTypes = {
  notifications: ImmutablePropTypes.list.isRequired,
  locale: PropTypes.string.isRequired,
  markNotificationAsReadRequest: PropTypes.func.isRequired,
};

export default styled(Notifications)`
  background-color: #ffffff;
`;
