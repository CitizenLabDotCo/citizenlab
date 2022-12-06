import React from 'react';
import { adopt } from 'react-adopt';
import InfiniteScroll from 'react-infinite-scroller';
import styled from 'styled-components';
import { Spinner, Dropdown } from '@citizenlab/cl2-component-library';
import GetNotifications, {
  GetNotificationsChildProps,
} from 'resources/GetNotifications';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { fontSizes, colors } from 'utils/styleUtils';
import Notification from './components/Notification';
import EmptyStateImg from './assets/no_notification_image.svg';
import messages from './messages';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EmptyStateContainer = styled.div`
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
`;

const EmptyStateImageWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const EmptyStateImage = styled.img`
  margin-bottom: 20px;
`;

const EmptyStateText = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  text-align: center;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  margin-left: 15px;
  margin-right: 15px;
`;

interface InputProps {
  dropdownOpened: boolean;
  toggleDropdown: () => void;
}

interface DataProps {
  notifications: GetNotificationsChildProps;
}

interface Props extends InputProps, DataProps {}

const NotificationsDropdown = ({
  toggleDropdown,
  dropdownOpened,
  notifications,
}: Props) => {
  const handleToggleDropdown = (event: React.FormEvent<any>) => {
    event.preventDefault();
    toggleDropdown();
  };

  return (
    <Dropdown
      id="notifications-dropdown"
      width="300px"
      mobileWidth="220px"
      top="42px"
      right="-5px"
      mobileRight="-15px"
      opened={dropdownOpened}
      onClickOutside={handleToggleDropdown}
      content={
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
          {!isNilOrError(notifications?.list) && notifications.list.length > 0 && (
            <>
              {notifications.list.map((notification) => (
                <Notification
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </>
          )}
          {(notifications?.list === null ||
            notifications?.list?.length === 0) && (
            <EmptyStateContainer>
              <EmptyStateImageWrapper>
                <EmptyStateImage
                  src={EmptyStateImg}
                  role="presentation"
                  alt=""
                />
              </EmptyStateImageWrapper>
              <EmptyStateText>
                <FormattedMessage {...messages.noNotifications} />
              </EmptyStateText>
            </EmptyStateContainer>
          )}
        </InfiniteScroll>
      }
    />
  );
};

const Data = adopt<DataProps, InputProps>({
  notifications: <GetNotifications />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <NotificationsDropdown {...inputProps} {...dataProps} />}
  </Data>
);
