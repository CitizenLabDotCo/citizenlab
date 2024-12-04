import { defineMessages } from 'react-intl';

export default defineMessages({
  filters: {
    id: 'app.components.FiltersModal.filters',
    defaultMessage: 'Filters',
  },
  showXResults: {
    id: 'app.containers.IdeaCards.showXResults',
    defaultMessage:
      'Show {ideasCount, plural, no {# results} one {# result} other {# results}}',
  },
  a11y_closeFilterPanel: {
    id: 'app.containers.IdeaCards.a11y_closeFilterPanel',
    defaultMessage: 'Close filters panel',
  },
});
