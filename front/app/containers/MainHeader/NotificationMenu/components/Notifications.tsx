import React from 'react';
import { adopt } from 'react-adopt';

// components
import {
  Box,
  Spinner,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import InfiniteScroll from 'react-infinite-scroller';
import Notification from './Notification';
import EmptyStateImg from '../assets/no_notification_image.svg';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

// resources
import GetNotifications, {
  GetNotificationsChildProps,
} from 'resources/GetNotifications';

// utils
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';

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

interface DataProps {
  notifications: GetNotificationsChildProps;
}

interface Props extends DataProps {}

export const Notifications = ({ notifications }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box data-testid="notifications-dropdown">
      <InfiniteScroll
        pageStart={0}
        loadMore={notifications.onLoadMore}
        useWindow={false}
        hasMore={notifications.hasMore}
        threshold={50}
        loader={
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            width="100%"
            key="0"
          >
            <Spinner />
          </Box>
        }
      >
        {!isNilOrError(notifications?.list) &&
          notifications.list.length > 0 && (
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
          <Box
            height="200px"
            display="flex"
            flexDirection="column"
            alignItems="stretch"
            justifyContent="center"
          >
            <Box display="flex" justifyContent="center" mb="20px">
              <img src={EmptyStateImg} role="presentation" alt="" />
            </Box>
            <EmptyStateText>
              {formatMessage({ ...messages.noNotifications })}
            </EmptyStateText>
          </Box>
        )}
      </InfiniteScroll>
    </Box>
  );
};

const Data = adopt<DataProps>({
  notifications: <GetNotifications />,
});

export default () => (
  <Data>{(dataProps: DataProps) => <Notifications {...dataProps} />}</Data>
);
