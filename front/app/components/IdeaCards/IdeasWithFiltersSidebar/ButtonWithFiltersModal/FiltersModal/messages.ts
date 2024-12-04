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
  showXResults: {
    id: 'app.containers.IdeaCards.showXResults',
    defaultMessage:
      'Show {ideasCount, plural, no {# results} one {# result} other {# results}}',
  },
  a11y_disabledResetFiltersDescription: {
    id: 'app.components.IdeaCards.a11y_disabledResetFiltersDescription',
    defaultMessage:
      'This button is used to deselect all filters. To enable this button, you must select at least one filter.',
  },
  a11y_closeFilterPanel: {
    id: 'app.containers.IdeaCards.a11y_closeFilterPanel',
    defaultMessage: 'Close filters panel',
  },
});
