import { defineMessages } from 'react-intl';

export default defineMessages({
  followedItemsTitle: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.FollowedItems.title',
    defaultMessage: 'Followed items',
  },
  defaultTitle: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.FollowedItems.defaultTitle',
    defaultMessage: 'For you',
  },
  noData: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.FollowedItems.noData2',
    defaultMessage:
      'This widget will only be shown to the user if there are projects relevant for them based on their follow preferences. If you see this message, it means that you (the admin) are not following anything at the moment. This message will not be visible on the real homepage.',
  },
  thisWidgetShows: {
    id: 'app.containers.Admin.pagesAndMenu.ContentBuilder.CraftComponents.FollowedItems.thisWidgetShows',
    defaultMessage:
      'This widget shows each user projects <b>based on their follow preferences</b>. This includes projects that they follow, as well as projects where they follow inputs, and projects related to topics or areas that they are interested in.',
  },
});
