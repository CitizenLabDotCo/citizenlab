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
import ImmutablePropTypes from 'react-immutable-proptypes';
import {
  loadNotificationsRequest, markAllNotificationsAsReadRequest, markNotificationAsReadRequest,
} from 'resources/notifications/actions';
import Loader from 'components/loaders';
import { LOAD_NOTIFICATIONS_REQUEST } from 'resources/notifications/constants';
import CommentOnCommentNotification from './components/CommentOnCommentNotification';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Button } from './components/Button';
import { Image } from 'semantic-ui-react';
import * as noNotificationImage from './assets/no_notification_image.png';
import { connect } from 'react-redux';


export class NotificationMenu extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide context to bindings
    this.loadMoreNotifications = this.loadMoreNotifications.bind(this);
    this.clearNotifications = this.clearNotifications.bind(this);
    this.getNotificationComponent = this.getNotificationComponent.bind(this);
  }

  getNotificationComponent(notification) {
    if (notification.type === 'comment_on_your_comment') {
      return (<CommentOnCommentNotification
        key={notification.id}
        attributes={notification.attributes}
        clearNotification={this.props.markNotificationAsReadRequest}
      />);
    } else if (notification.type === 'comment_on_your_idea') {
      // TODO: replace with CommentOnIdeaNotification once implemented
      return (<CommentOnCommentNotification
        key={notification.id}
        attributes={notification.attributes}
        clearNotification={this.props.markNotificationAsReadRequest}
      />);
    }
  }

  clearNotifications() {
    this.props.markAllNotificationsAsReadRequest();
  }

  loadMoreNotifications() {
    const { nextPageNumber, nextPageItemCount } = this.props;

    this.props.loadNotificationsRequest(nextPageNumber, nextPageItemCount);
  }

  render() {
    const { notifications, nextPageNumber, nextPageItemCount, show, className } = this.props;
    const classRef = this;

    return (
      <div className={className}>
        {show && <Loader
          resourceLoader={loadNotificationsRequest}
          loaderParameters={[nextPageNumber, nextPageItemCount]}
          loadingMessage={messages.loading}
          errorMessage={messages.error}
          listenenTo={LOAD_NOTIFICATIONS_REQUEST}
        >
          {notifications && <span>
            {notifications.size > 0 && notifications.toJS().map((notification) => <span>
              {classRef.getNotificationComponent(notification)}
              <div onClick={this.clearNotifications}>
                <FormattedMessage {...messages.clearAll} />
              </div>
            </span>)}

            {nextPageNumber && <Button onClick={this.loadMoreNotifications}>
              <FormattedMessage {...messages.loadMore} />
            </Button>}

            {notifications.size === 0 && <div>
              <Image src={noNotificationImage} centered />
              <FormattedMessage {...messages.noNotifications} />
            </div>}
          </span>}
        </Loader>}
      </div>
    );
  }
}

NotificationMenu.propTypes = {
  notifications: ImmutablePropTypes.list,
  loadNotificationsRequest: PropTypes.func.isRequired,
  markNotificationAsReadRequest: PropTypes.func.isRequired,
  markAllNotificationsAsReadRequest: PropTypes.func.isRequired,
  nextPageNumber: PropTypes.number.isRequired,
  nextPageItemCount: PropTypes.number.isRequired,
  show: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectNotifications,
  notifications: makeSelectNotifications(),
  nextPageNumber: (state) => state.getIn(['tempState', LOAD_NOTIFICATIONS_REQUEST, 'nextPageNumber']),
  nextPageItemCount: (state) => state.getIn(['tempState', LOAD_NOTIFICATIONS_REQUEST, 'nextPageItemCount']),
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  loadNotificationsRequest,
  markNotificationAsReadRequest,
  markAllNotificationsAsReadRequest,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(styled(NotificationMenu)`
  position: absolute;
  width: 250px;
  top: 39px;
`);
