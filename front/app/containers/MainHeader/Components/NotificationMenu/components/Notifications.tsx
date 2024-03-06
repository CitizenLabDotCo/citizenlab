import React from 'react';

import {
  Box,
  Spinner,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import InfiniteScroll from 'react-infinite-scroller';
import styled from 'styled-components';

import useNotifications from 'api/notifications/useNotifications';

import { useIntl } from 'utils/cl-intl';

import EmptyStateImg from '../assets/no_notification_image.svg';
import messages from '../messages';

import Notification from './Notification';

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
