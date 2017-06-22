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
import * as ImmutablePropTypes from 'react-immutable-proptypes';
import {
  loadNotificationsRequest, markAllNotificationsAsReadRequest, markNotificationAsReadRequest,
} from 'resources/notifications/actions';
import Loader from 'components/loaders';
import { LOAD_NOTIFICATIONS_REQUEST } from 'resources/notifications/constants';
import CommentOnCommentNotification from './components/CommentOnCommentNotification';

export class NotificationMenu extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide context to bindings
    this.loadMoreNotifications = this.loadMoreNotifications.bind(this);
  }

  loadMoreNotifications() {
    const { nextPageNumber, nextPageItemCount } = this.props;

    this.props.loadNotifications(nextPageNumber, nextPageItemCount);
  }


  render() {
    const { notifications, nextPageNumber, nextPageItemCount } = this.props;

    return (
      <div>
        <Loader
          resourceLoader={loadNotificationsRequest}
          loaderParameters={{
            nextPageNumber,
            nextPageItemCount,
          }}
          loadingMessage={messages.loading}
          errorMessage={messages.error}
          listenenTo={LOAD_NOTIFICATIONS_REQUEST}
        >
          {notifications && notifications.toJS().map((notification) => (<CommentOnCommentNotification
            key={notification.id}
            // OTHER PROPS HERE
          />))}
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
  notificationCount: PropTypes.number,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectNotifications,
  notifications: makeSelectNotifications(),
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  loadNotifications: loadNotificationsRequest,
  setNotificationAsRead: markNotificationAsReadRequest,
  setAllNotificationsAsRead: markAllNotificationsAsReadRequest,
}, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  nextPageNumber: ,
  nextPageItemCount: ,
  notificationCount: ,
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
});

export default preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(NotificationMenu);
