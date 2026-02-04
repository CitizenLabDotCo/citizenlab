import { defineMessages } from 'react-intl';

export default defineMessages({
  searchPlaceholder: {
    id: 'app.containers.SearchInput.searchPlaceholder',
    defaultMessage: 'Search',
  },
  searchAriaLabel: {
    id: 'app.containers.SearchInput.searchAriaLabel',
    defaultMessage: 'Search',
  },
  removeSearchTerm: {
    id: 'app.containers.SearchInput.removeSearchTerm',
    defaultMessage: 'Remove search term',
  },
  searchTerm: {
    id: 'app.containers.SearchInput.searchTerm',
    defaultMessage: 'Search term: {searchTerm}',
  },
  searchLabel: {
    id: 'app.containers.SearchInput.searchLabel',
    defaultMessage: 'Search',
  },
  a11y_searchResultsHaveChanged1: {
    id: 'app.containers.SearchInput.a11y_searchResultsHaveChanged1',
    defaultMessage:
      '{numberOfSearchResults, plural, =0 {# search results have loaded} one {# search result has loaded} other {# search results have loaded}}.',
  },
  a11y_projectsAvailable: {
    id: 'app.containers.SearchInput.a11y_projectsAvailable',
    defaultMessage:
      '{numberOfProjects, plural, =0 {There are no projects available} one {There is # project available} other {There are # projects available}}.',
  },
  a11y_searchQuery: {
    id: 'app.containers.SearchInput.a11y_searchQuery',
    defaultMessage: 'Searching for {searchTerm}.',
  },
  a11y_filtersAppliedCount: {
    id: 'app.containers.SearchInput.a11y_filtersAppliedCount',
    defaultMessage:
      '{numberOfFilters, plural, =0 {No filters applied} one {# filter applied} other {# filters applied}}.',
  },
});
