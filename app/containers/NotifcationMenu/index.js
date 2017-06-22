/*
 *
 * NotificationMenu
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import selectNotifications, { makeSelectNotifications } from './selectors';
import messages from './messages';
import { bindActionCreators } from 'redux';
import { preprocess } from 'utils/reactRedux';
import ImmutablePropTypes from 'react-immutable-proptypes';
import {
  loadNotificationsRequest, markAllNotificationsAsReadRequest, markNotificationAsReadRequest,
} from 'resources/notifications/actions';
import Loader from 'components/loaders';
import { LOAD_NOTIFICATIONS_REQUEST } from 'resources/notifications/constants';
import CommentOnCommentNotification from './components/CommentOnCommentNotification';
import styled from 'styled-components';
import NotificationCount from './components/NotificationCount';
import { FormattedMessage } from 'react-intl';
import { Button } from './components/Button';

export class NotificationMenu extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide context to bindings
    this.loadMoreNotifications = this.loadMoreNotifications.bind(this);
    this.clearNotifications = this.clearNotifications.bind(this);
  }

  getNotificationComponent(notification) {
    if (notification.type === 'comment_on_your_comment') {
      return (<CommentOnCommentNotification
        key={notification.id}
        attributes={notification.attributes}
      />);
    } else if (notification.type === 'comment_on_your_idea') {
      // TODO: replace with CommentOnIdeaNotification once implemented
      return (<CommentOnCommentNotification
        key={notification.id}
        attributes={notification.attributes}
      />);
    }
  }

  clearNotifications() {
    this.props.setAllNotificationsAsRead();
  }

  loadMoreNotifications() {
    const { nextPageNumber, nextPageItemCount } = this.props;

    this.props.loadNotifications(nextPageNumber, nextPageItemCount);
  }

  render() {
    const { notifications, nextPageNumber, nextPageItemCount } = this.props;
    const classRef = this;

    return (
      <div>
        <Loader
          resourceLoader={loadNotificationsRequest}
          loaderParameters={[nextPageNumber, nextPageItemCount]}
          loadingMessage={messages.loading}
          errorMessage={messages.error}
          listenenTo={LOAD_NOTIFICATIONS_REQUEST}
        >
          {notifications.toJS().map((notification) => classRef.getNotificationComponent(notification))}
          <NotificationCount count={notifications.size} />
          <Button onClick={this.loadMoreNotifications}>
            <FormattedMessage {...messages.loadMore} />
          </Button>
          <div onClick={this.clearNotifications}>
            <FormattedMessage {...messages.clearAll} />
          </div>
        </Loader>
      </div>
    );
  }
}

NotificationMenu.propTypes = {
  notifications: ImmutablePropTypes.list,
  loadNotifications: PropTypes.func.isRequired,
  setNotificationAsRead: PropTypes.func.isRequired,
  setAllNotificationsAsRead: PropTypes.func.isRequired,
  nextPageNumber: PropTypes.number.isRequired,
  nextPageItemCount: PropTypes.number.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectNotifications,
  notifications: makeSelectNotifications(),
  nextPageNumber: (state) => state.getIn(['tempState', LOAD_NOTIFICATIONS_REQUEST, 'nextPageNumber']),
  nextPageItemCount: (state) => state.getIn(['tempState', LOAD_NOTIFICATIONS_REQUEST, 'nextPageItemCount']),
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  loadNotifications: loadNotificationsRequest,
  setNotificationAsRead: markNotificationAsReadRequest,
  setAllNotificationsAsRead: markAllNotificationsAsReadRequest,
}, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
});

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(styled(NotificationMenu)`
  // TODO
`);
