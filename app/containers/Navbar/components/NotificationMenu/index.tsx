
import React from 'react';
import { Subscription } from 'rxjs';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { injectTracks } from 'utils/analytics';
import NotificationCount from './components/NotificationCount';
import Dropdown from 'components/UI/Dropdown';
import Notification from './components/Notification';
import Spinner from 'components/UI/Spinner';
import { FormattedMessage } from 'utils/cl-intl';
import InfiniteScroll from 'react-infinite-scroller';
import { notificationsStream, TNotificationData, markAllAsRead } from 'services/notifications';
import { authUserStream } from 'services/auth';
import messages from './messages';
import tracks from '../../tracks';

const EmptyStateImg = require('./assets/no_notification_image.svg');

const Container = styled.div`
  position: relative;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${colors.label};
  font-size: ${fontSizes.large}px;
  line-height: 24px;
`;

const EmptyStateImage = styled.img`
  margin-bottom: 20px;
`;

const EmptyStateText = styled.div`
  text-align: center;
`;

type Props = {};

interface ITracks {
  clickOpenNotifications: () => void;
  clickCloseNotifications: () => void;
}

type State = {
  dropdownOpened: boolean,
  unreadCount?: number,
  notifications: TNotificationData[] | null;
  hasMore: boolean;
};

class NotificationMenu extends React.PureComponent<Props & ITracks, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      unreadCount: 0,
      dropdownOpened: false,
      notifications: null,
      hasMore: true,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
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

  toggleDropdown = (event: React.FormEvent<any>) => {
    event.preventDefault();

    this.setState(({ dropdownOpened }) => {
      if (!dropdownOpened) {
        this.props.clickOpenNotifications();
      } else {
        markAllAsRead();
        this.props.clickCloseNotifications();
      }

      return { dropdownOpened: !dropdownOpened };
    });
  }

  render() {
    const { notifications, hasMore, dropdownOpened } = this.state;
    return (
      <Container>
        <NotificationCount
          count={this.state.unreadCount}
          onClick={this.toggleDropdown}
        />
        <Dropdown
          width="300px"
          mobileWidth="220px"
          top="42px"
          right="-5px"
          mobileRight="-15px"
          opened={dropdownOpened}
          onClickOutside={this.toggleDropdown}
          content={(
            <InfiniteScroll
              pageStart={0}
              loadMore={this.loadNextPage}
              useWindow={false}
              hasMore={hasMore}
              threshold={50}
              loader={
                <LoadingContainer key="0">
                  <Spinner />
                </LoadingContainer>
              }
            >
              {notifications && notifications.length > 0 && notifications.map((notification) => {
                return (
                  <Notification
                    notification={notification}
                    key={notification.id}
                  />
                );
              })}
              {notifications && notifications.length === 0 &&
                <EmptyStateContainer>
                  <EmptyStateImage src={EmptyStateImg} role="presentation" alt="" />
                  <EmptyStateText><FormattedMessage {...messages.noNotifications} /></EmptyStateText>
                </EmptyStateContainer>
              }
            </InfiniteScroll>
          )}
        />
      </Container>
    );
  }
}

export default injectTracks<Props>(tracks)(NotificationMenu);
