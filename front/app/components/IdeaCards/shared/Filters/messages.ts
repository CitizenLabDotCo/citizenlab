import { defineMessages } from 'react-intl';

export default defineMessages({
  sortBy: {
    id: 'app.components.IdeaCards.filters.sortBy',
    defaultMessage: 'Sort by',
  },
  trending: {
    id: 'app.components.IdeaCards.filters.trending',
    defaultMessage: 'Trending',
  },
  random: {
    id: 'app.components.IdeaCards.filters.random',
    defaultMessage: 'Random',
  },
  popular: {
    id: 'app.components.IdeaCards.filters.popular',
    defaultMessage: 'Most liked',
  },
  newest: {
    id: 'app.components.IdeaCards.filters.newest',
    defaultMessage: 'New',
  },
  oldest: {
    id: 'app.components.IdeaCards.filters.oldest',
    defaultMessage: 'Old',
  },
  mostDiscussed: {
    id: 'app.components.IdeaCards.filters.mostDiscussed',
    defaultMessage: 'Most discussed',
  },
  sortChangedScreenreaderMessage: {
    id: 'app.components.IdeaCards.filters.sortChangedScreenreaderMessage',
    defaultMessage: 'Sorting changed to: {currentSortType}',
  },
});
