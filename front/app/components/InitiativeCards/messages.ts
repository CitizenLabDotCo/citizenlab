import { defineMessages } from 'react-intl';

export default defineMessages({
  trending: {
    id: 'app.components.InitiativeCards.trending',
    defaultMessage: 'Trending',
  },
  random: {
    id: 'app.components.InitiativeCards.random',
    defaultMessage: 'Random',
  },
  popular: {
    id: 'app.components.InitiativeCards.popular',
    defaultMessage: 'Popular',
  },
  newest: {
    id: 'app.components.InitiativeCards.newest',
    defaultMessage: 'Newest',
  },
  oldest: {
    id: 'app.components.InitiativeCards.oldest',
    defaultMessage: 'Oldest',
  },
  sortTitle: {
    id: 'app.components.InitiativeCards.sortTitle',
    defaultMessage: 'Sorting',
  },
  filter: {
    id: 'app.components.InitiativeCards.filter',
    defaultMessage: 'Filter',
  },
  searchPlaceholder: {
    id: 'app.components.InitiativeCards.searchPlaceholder',
    defaultMessage: 'Search for an initiative',
  },
  showInitiatives: {
    id: 'app.components.InitiativeCards.showInitiatives',
    defaultMessage: 'Show initiatives',
  },
  showXInitiatives: {
    id: 'app.components.InitiativeCards.showXInitiatives',
    defaultMessage:
      'Show {initiativesCount, plural, no {# initiatives} one {# initiative} other {# initiatives}}',
  },
  map: {
    id: 'app.components.InitiativeCards.map',
    defaultMessage: 'Map',
  },
  list: {
    id: 'app.components.InitiativeCards.list',
    defaultMessage: 'List',
  },
  xInitiatives: {
    id: 'app.components.InitiativeCards.xInitiatives',
    defaultMessage:
      '{initiativesCount, plural, no {# initiatives} one {# initiative} other {# initiatives}}',
  },
  showMore: {
    id: 'app.components.InitiativeCards.showMore',
    defaultMessage: 'Show more',
  },
  resetFilters: {
    id: 'app.components.InitiativeCards.resetFilters',
    defaultMessage: 'Reset filters',
  },
  noInitiativesForFilter: {
    id: 'app.ccomponents.InitiativeCards.noInitiativesForFilter',
    defaultMessage: 'No initiatives found',
  },
  tryOtherFilter: {
    id: 'app.components.InitiativeCards.tryOtherFilter',
    defaultMessage:
      "Try adjusting your search or filter to find what you're looking for",
  },
  a11y_totalInitiatives: {
    id: 'app.containers.IdeaCards.a11y_totalInitiatives',
    defaultMessage: 'Total initiatives: {initiativeCount}',
  },
  a11y_itemsHaveChanged: {
    id: 'app.containers.SearchInput.a11y_itemsHaveChanged',
    defaultMessage: '{sortOder} proposals have loaded.',
  },
});
