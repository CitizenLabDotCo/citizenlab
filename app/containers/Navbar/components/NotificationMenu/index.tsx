
import * as React from 'react';
import * as Rx from 'rxjs/Rx';

import styled from 'styled-components';
import { injectTracks } from 'utils/analytics';

import NotificationCount from './components/NotificationCount';
import Popover from 'components/Popover';
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

const StyledPopover = styled(Popover)`
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
}

type State = {
  PopoverOpen: boolean,
  unreadCount?: number,
  notifications: TNotificationData[] | null;
  hasMore: boolean;
};

class NotificationMenu extends React.PureComponent<Props & ITracks, State> {
  subscriptions: Rx.Subscription[];
  dropdownElement: HTMLElement | null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      unreadCount: 0,
      PopoverOpen: false,
      notifications: null,
      hasMore: true,
    };
    this.subscriptions = [];
    this.dropdownElement = null;
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
    if (this.dropdownElement) {
      this.dropdownElement.removeEventListener('wheel', this.scrolling, false);
    }

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  isEmpty = () => (
    this.state.notifications && this.state.notifications.length === 0
  )

  onClickIcon = () => {
    if (this.state.PopoverOpen)
      this.closePopover();
    else
      this.openPopover();
  }

  openPopover = () => {
    this.setState({ PopoverOpen: true });
    this.props.clickOpenNotifications();
  }

  closePopover = () => {
    this.setState({ PopoverOpen: false });
    markAllAsRead();
    this.props.clickCloseNotifications();
  }

  handleSetRef = (element) => {
    if (element) {
      this.dropdownElement = element;

      if (this.dropdownElement) {
        this.dropdownElement.addEventListener('wheel', this.scrolling, false);
      }
    }
  }

  scrolling = (event: WheelEvent) => {
    if (this.dropdownElement) {
      const deltaY = (event.deltaMode === 1 ? event.deltaY * 20 : event.deltaY);
      this.dropdownElement.scrollTop += deltaY;
      event.preventDefault();
    }
  }

  render() {
    const { notifications, hasMore } = this.state;
    return (
      <Container>
        <NotificationCount
          count={this.state.unreadCount}
          onClick={this.onClickIcon}
        />
        <StyledPopover
          open={this.state.PopoverOpen}
          onCloseRequest={this.closePopover}
          setRef={this.handleSetRef}
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
        </StyledPopover>
      </Container>
    );
  }
}

export default injectTracks<Props>(tracks)(NotificationMenu);
