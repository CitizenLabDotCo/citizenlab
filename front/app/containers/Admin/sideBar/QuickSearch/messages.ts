import { defineMessages } from 'react-intl';

export default defineMessages({
  quickSearch: {
    id: 'app.containers.AdminPage.SideBar.QuickSearch.quickSearch',
    defaultMessage: 'Quick search',
  },
  placeholder: {
    id: 'app.containers.AdminPage.SideBar.QuickSearch.placeholder',
    defaultMessage: 'Find settings, projects and phases',
  },
  recents: {
    id: 'app.containers.AdminPage.SideBar.QuickSearch.recents',
    defaultMessage: 'Recents',
  },
  noResults: {
    id: 'app.containers.AdminPage.SideBar.QuickSearch.noResults',
    defaultMessage: 'No results for "{query}"',
  },
  resultsCount: {
    id: 'app.containers.AdminPage.SideBar.QuickSearch.resultsCount',
    defaultMessage:
      '{count, plural, =0 {No results} one {# result} other {# results}}',
  },
});
