import React from 'react';
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { injectTracks } from 'utils/analytics';
import NotificationCount from './components/NotificationCount';
import Dropdown from 'components/UI/Dropdown';
import Notification from './components/Notification';
import Spinner from 'components/UI/Spinner';
import { FormattedMessage } from 'utils/cl-intl';
import InfiniteScroll from 'react-infinite-scroller';
import { authUserStream } from 'services/auth';
import messages from './messages';
import tracks from '../../tracks';
import { markAllAsRead } from 'services/notifications';
import { Subscription } from 'rxjs';
import GetNotifications, { GetNotificationsChildProps } from 'resources/GetNotifications';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

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

interface InputProps {}

interface DataProps {
  notifications: GetNotificationsChildProps;
}

interface Props extends InputProps, DataProps {}

interface ITracks {
  clickOpenNotifications: () => void;
  clickCloseNotifications: () => void;
}

type State = {
  dropdownOpened: boolean,
  unreadCount?: number,
};

class NotificationMenu extends React.PureComponent<Props & ITracks, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      unreadCount: 0,
      dropdownOpened: false,
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

  renderList = () => {
    const { notifications: { list } } = this.props;
    if (isNilOrError(list) || list.length === 0) return [];
    return list.map((notification) => {
      return (
        <Notification
          notification={notification}
          key={notification.id}
        />
      );
    });
  }

  render() {
    const { dropdownOpened } = this.state;
    const { notifications } = this.props;

    const notificationsList = this.renderList();

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
              loadMore={notifications.onLoadMore}
              useWindow={false}
              hasMore={notifications.hasMore}
              threshold={50}
              loader={
                <LoadingContainer key="0">
                  <Spinner />
                </LoadingContainer>
              }
            >
              {notificationsList}
              {notifications.list !== undefined && notificationsList && notificationsList.length === 0 &&
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

const NotificationMenuWithHocs = injectTracks<Props>(tracks)(NotificationMenu);

const Data = adopt<DataProps, InputProps>({
  notifications: <GetNotifications/>,
});

export default (inputProps: InputProps) => (
  <Data>
    {dataProps => <NotificationMenuWithHocs {...inputProps} {...dataProps} />}
  </Data>
);
