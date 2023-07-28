import React from 'react';

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

// styles
import styled from 'styled-components';
import useNotifications from 'api/notifications/useNotifications';

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

export const Notifications = () => {
  const { formatMessage } = useIntl();
  const {
    data: notifications,
    hasNextPage,
    fetchNextPage,
    isLoading,
  } = useNotifications({});

  const flattenNotifications = notifications?.pages.flatMap(
    (page) => page.data
  );

  if (isLoading) {
    return <Spinner />;
  }

  if (!flattenNotifications) return null;

  return flattenNotifications.length === 0 ? (
    <Box display="flex" alignItems="center" py="50px">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Box mb="20px">
          <img src={EmptyStateImg} role="presentation" alt="" />
        </Box>
        <EmptyStateText>
          {formatMessage({ ...messages.noNotifications })}
        </EmptyStateText>
      </Box>
    </Box>
  ) : (
    // height 100% is needed when we have >0 notifications in the
    // notifications popup in the admin sidebar with current implementation.
    // Not setting this will
    // hide a part of the first notification there.
    <Box height="100%">
      <InfiniteScroll
        pageStart={0}
        loadMore={() => fetchNextPage()}
        useWindow={false}
        hasMore={hasNextPage}
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
        {flattenNotifications.length > 0 &&
          flattenNotifications.map((notification) => (
            <Notification key={notification.id} notification={notification} />
          ))}
      </InfiniteScroll>
    </Box>
  );
};
export default Notifications;
