import { defineMessages } from 'react-intl';

export default defineMessages({
  find: {
    id: 'app.containers.AdminPage.SideBar.QuickSearch.find',
    defaultMessage: 'Find',
  },
  placeholder: {
    id: 'app.containers.AdminPage.SideBar.QuickSearch.placeholder',
    defaultMessage: 'Find settings, projects and pages',
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
