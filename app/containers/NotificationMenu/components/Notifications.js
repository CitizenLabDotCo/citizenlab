import React from 'react';
import PropTypes from 'prop-types';
import CommentOnCommentNotification from './CommentOnCommentNotification/index';
import CommentOnIdeaNotification from './CommentOnIdeaNotification/index';
import MentionOnCommentNotification from './MentionOnCommentNotification/index';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from 'styled-components';

const NotificationWrapperStyled = styled.div`
  &:hover {
    background-color: #f9f9f9;
   
    // show 'clear notification' button on hover
    div > button.clear-notification {
      display: block !important;
    }
    
    opacity: ${(props) => props.isRead ? '0.5' : 'inherit'};
  }
`;

class Notifications extends React.PureComponent {
  constructor() {
    super();

    // provide context to bindings
    this.getNotificationComponent = this.getNotificationComponent.bind(this);
  }

  getNotificationComponent(notification, locale) {
    if (notification.attributes.type === 'comment_on_your_comment') {
      return (<NotificationWrapperStyled isRead={!!notification.attributes.read_at}><CommentOnCommentNotification
        notification={notification}
        locale={locale}
        clearNotification={this.props.markNotificationAsReadRequest}
      /></NotificationWrapperStyled>);
    } else if (notification.attributes.type === 'comment_on_your_idea') {
      return (<NotificationWrapperStyled isRead={!!notification.attributes.read_at}><CommentOnIdeaNotification
        notification={notification}
        locale={locale}
        clearNotification={this.props.markNotificationAsReadRequest}
      /></NotificationWrapperStyled>);
    } else if (notification.attributes.type === 'mention_in_comment') {
      return (<NotificationWrapperStyled isRead={!!notification.attributes.read_at}><MentionOnCommentNotification
        notification={notification}
        locale={locale}
        clearNotification={this.props.markNotificationAsReadRequest}
      /></NotificationWrapperStyled>);
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
  padding-top: 10px;
`;
