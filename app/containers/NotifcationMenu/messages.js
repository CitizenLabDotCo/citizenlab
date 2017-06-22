/*
 * NotificationMenu Messages
 *
 * This contains all the text for the NotificationMenu component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  loading: {
    id: 'app.containers.NotificationMenu.loading',
    defaultMessage: 'Loading notifications...',
  },
  error: {
    id: 'app.containers.NotificationMenu.error',
    defaultMessage: 'Couldn\'t load notifications',
  },
  loadMore: {
    id: 'app.containers.NotificationMenu.loadMore',
    defaultMessage: 'Load more...',
  },
  clearAll: {
    id: 'app.containers.NotificationMenu.clearAll',
    defaultMessage: 'Clear all',
  },
});
