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
import { LOAD_NOTIFICATIONS_REQUEST } from 'resources/notifications/constants';
import CommentOnCommentNotification from './components/CommentOnCommentNotification';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Image } from 'semantic-ui-react';
import * as noNotificationImage from './assets/no_notification_image.png';
import { connect } from 'react-redux';
import WatchSagas from 'containers/WatchSagas';
import sagas from 'resources/notifications/sagas';
import { selectLanguage } from 'containers/LanguageProvider/selectors';

export class NotificationMenu extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide context to bindings
    this.loadMoreNotifications = this.loadMoreNotifications.bind(this);
    this.clearNotifications = this.clearNotifications.bind(this);
    this.getNotificationComponent = this.getNotificationComponent.bind(this);
  }

  componentDidMount() {
    const { nextPageNumber, nextPageItemCount } = this.props;
    this.props.loadNotificationsRequest(nextPageNumber, nextPageItemCount);
  }

  getNotificationComponent(notification, locale) {
    if (notification.attributes.type === 'comment_on_your_comment') {
      return (<CommentOnCommentNotification
        id={notification.id}
        locale={locale}
        attributes={notification.attributes}
        clearNotification={this.props.markNotificationAsReadRequest}
      />);
    } else if (notification.attributes.type === 'comment_on_your_idea') {
      // TODO: replace with CommentOnIdeaNotification once implemented
      return (<CommentOnCommentNotification
        id={notification.id}
        locale={locale}
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
    const { notifications, show, className, loading, error, locale } = this.props;
    const classRef = this;

    const localeString = locale.toJS().locale;

    return (<div>
      <WatchSagas sagas={sagas} />
      {show && <div className={className}>
        <div>
          {/* NOTIFICATIONS */}
          {notifications && <span>
            {notifications.size > 0 && notifications.toJS().map((notification) => <span key={notification.id}>
              {classRef.getNotificationComponent(notification, localeString)}
            </span>)}
            {notifications.size > 0 && <button onClick={this.clearNotifications}>
              <FormattedMessage {...messages.clearAll} />
            </button>}

            {/* STATUS MESSAGES */}
            {notifications.size === 0 && <div>
              <Image src={noNotificationImage} centered />
              <FormattedMessage {...messages.noNotifications} />
            </div>}
            {error && <FormattedMessage {...messages.error} />}
            {loading && <FormattedMessage {...messages.loading} />}
          </span>}
        </div>
      </div>}
    </div>);
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
  loading: PropTypes.bool,
  error: PropTypes.bool,
  className: PropTypes.string,
  locale: ImmutablePropTypes.map,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectNotifications,
  notifications: makeSelectNotifications(),
  nextPageNumber: (state) => state.getIn(['notificationMenu', 'nextPageNumber']),
  nextPageItemCount: (state) => state.getIn(['notificationMenu', 'nextPageItemCount']),
  loading: (state) => state.getIn(['tempState', LOAD_NOTIFICATIONS_REQUEST, 'loading']),
  error: (state) => state.getIn(['tempState', LOAD_NOTIFICATIONS_REQUEST, 'error']),
  locale: selectLanguage,
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  loadNotificationsRequest,
  markNotificationAsReadRequest,
  markAllNotificationsAsReadRequest,
}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(styled(NotificationMenu)`
  position: absolute;
  width: 384.9px;
  height: 387px;
  top: 39px;
  right: 0;
  overflow-y: scroll;
  border-radius: 5px;
  background-color: #ffffff;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2);
`);
