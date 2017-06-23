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
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Image } from 'semantic-ui-react';
import * as noNotificationImage from './assets/no_notification_image.svg';
import { connect } from 'react-redux';
import WatchSagas from 'containers/WatchSagas';
import sagas from 'resources/notifications/sagas';
import { selectLanguage } from 'containers/LanguageProvider/selectors';
import Notifications from './components/Notifications';
import ClearNotificationsFooter from './ClearNotificationsFooter';
import InfiniteScroll from 'react-infinite-scroller';

export class NotificationMenu extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide context to bindings
    this.loadMoreNotifications = this.loadMoreNotifications.bind(this);
    this.clearNotifications = this.clearNotifications.bind(this);
  }

  componentDidMount() {
    const { nextPageNumber, nextPageItemCount } = this.props;
    this.props.loadNotificationsRequest(nextPageNumber, nextPageItemCount);
  }

  clearNotifications() {
    this.props.markAllNotificationsAsReadRequest();
  }

  loadMoreNotifications() {
    const { nextPageNumber, nextPageItemCount } = this.props;

    this.props.loadNotificationsRequest(nextPageNumber, nextPageItemCount);
  }

  render() {
    const {
      notifications, show, className, error, locale,
      markNotificationAsReadRequest: mnarr, nextPageNumber,
    } = this.props;

    const localeString = locale.toJS().locale;

    return (<div>
      <WatchSagas sagas={sagas} />
      {show && <InfiniteScroll
        element={'div'}
        hasMore={!!nextPageNumber}
        threshold={5}
        loadMore={this.loadMoreNotifications}
        loader={<FormattedMessage {...messages.loading} />}
        className={className}
      >
        <div
          style={{
            height: '387px',
            overflowY: 'scroll',
          }}
        >
          {/* NOTIFICATIONS */}
          {notifications && <span>
            <Notifications
              notifications={notifications}
              markNotificationAsReadRequest={mnarr}
              locale={localeString}
            />

            {/* STATUS MESSAGES */}
            {notifications.size === 0 && <div
              style={{
                margin: '15px auto',
                textAlign: 'center',
                color: 'rgba(34, 34, 34, 0.3)',
              }}
            >
              <Image src={noNotificationImage} centered />
              <FormattedMessage {...messages.noNotifications} />
            </div>}
            {error && <FormattedMessage {...messages.error} />}
          </span>}
        </div>
        <ClearNotificationsFooter onClick={this.props.markAllNotificationsAsReadRequest} />
      </InfiniteScroll>}
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
  error: PropTypes.bool,
  className: PropTypes.string,
  locale: ImmutablePropTypes.map,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectNotifications,
  notifications: makeSelectNotifications(),
  nextPageNumber: (state) => state.getIn(['notificationMenu', 'nextPageNumber']),
  nextPageItemCount: (state) => state.getIn(['notificationMenu', 'nextPageItemCount']),
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
  top: 39px;
  right: 0;
  border-radius: 5px;
  background-color: #ffffff;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2);
`);
