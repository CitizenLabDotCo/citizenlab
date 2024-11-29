import { defineMessages } from 'react-intl';

export default defineMessages({
  filters: {
    id: 'app.components.FiltersModal.filters',
    defaultMessage: 'Filters',
  },
  resetFilters: {
    id: 'app.components.FiltersModal.resetFilters',
    defaultMessage: 'Reset filters',
  },
  a11y_closeFilterPanel: {
    id: 'app.components.FiltersModal.a11y_closeFilterPanel',
    defaultMessage: 'Close filter panel',
  },
  showXResults: {
    id: 'app.containers.IdeaCards.showXResults',
    defaultMessage:
      'Show {ideasCount, plural, no {# results} one {# result} other {# results}}',
  },
});
