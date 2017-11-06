
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

import styled from 'styled-components';
import { injectTracks } from 'utils/analytics';

import NotificationCount from './components/NotificationCount';
import Dropdown from 'components/Dropdown';
import Notification from './components/Notification';
import Spinner from 'components/UI/Spinner';
import { FormattedMessage } from 'react-intl';
import InfiniteScroll from 'react-infinite-scroller';

import { notificationsStream, INotificationData, markAllAsRead } from 'services/notifications';
import { authUserStream } from 'services/auth';

import messages from './messages';
import tracks from '../../tracks';

const EmptyStateImg = require('./assets/no_notification_image.svg');

const Container = styled.div`
  position: relative;
`;

const StyledDropdown = styled(Dropdown)`
  width: 370px;
  max-height: 400px;
  overflow-y: auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  height: 200px;
  color: #A6A6A6;
  font-size: 18px;
`;


type Props = {

};

interface ITracks {
  clickOpenNotifications: () => void;
  clickCloseNotifications: () => void;
};

type State = {
  dropdownOpen: boolean,
  unreadCount?: number,
  notifications: INotificationData[] | null;
  hasMore: boolean;
};

class NotificationMenu extends React.PureComponent<Props & ITracks, State> {
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      unreadCount: 0,
      dropdownOpen: false,
      notifications: null,
      hasMore: true,
    };
  }

  componentWillMount() {
    const authUser$ = authUserStream().observable;
    this.subscriptions = [
      authUser$.subscribe((response) => {
        this.setState({ unreadCount: response && response.data.attributes.unread_notifications || undefined });
      })
    ];
  }

  loadNextPage = (page = 1) => {
    const notifications$ = notificationsStream({
      queryParameters: {
        'page[size]': 8,
        'page[number]': page,
      },
    }).observable;

    this.subscriptions.push(
      notifications$.subscribe((response) => {
        const notifications = this.state.notifications ? this.state.notifications.concat(response.data) : response.data;
        const hasMore = !!response.links.next;
        this.setState({ notifications, hasMore });
      })
    );
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  isEmpty = () => (
    this.state.notifications && this.state.notifications.length === 0
  )

  onClickIcon = () => {
    if (this.state.dropdownOpen)
      this.closeDropdown();
    else
      this.openDropdown();
  }

  openDropdown = () => {
    this.setState({ dropdownOpen: true });
    this.props.clickOpenNotifications();
  }

  closeDropdown = () => {
    this.setState({ dropdownOpen: false });
    markAllAsRead();
    this.props.clickCloseNotifications();
  }

  render() {
    const { notifications, hasMore } = this.state;
    return (
      <Container>
        <NotificationCount
          count={this.state.unreadCount}
          onClick={this.onClickIcon}
        />
        <StyledDropdown
          open={this.state.dropdownOpen}
          onCloseRequest={this.closeDropdown}
        >
          <InfiniteScroll
            pageStart={0}
            loadMore={this.loadNextPage}
            useWindow={false}
            hasMore={hasMore}
            threshold={50}
            loader={<LoadingContainer>
                <Spinner color="#84939E" />
              </LoadingContainer>}
          >
            {notifications && notifications.map((notification) => (
              <Notification
                notification={notification}
                key={notification.id}
              />
            ))}
            {this.isEmpty() &&
              <EmptyStateContainer>
                <img src={EmptyStateImg} role="presentation" alt="" />
                <FormattedMessage {...messages.noNotifications} />
              </EmptyStateContainer>
            }
          </InfiniteScroll>
        </StyledDropdown>
      </Container>
    );
  }
}


export default injectTracks<Props>(tracks)(NotificationMenu);
