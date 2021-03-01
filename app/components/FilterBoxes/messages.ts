import { defineMessages } from 'react-intl';

export default defineMessages({
  statusTitle: {
    id: 'app.components.FilterBoxes.statusTitle',
    defaultMessage: 'Status',
  },
  all: {
    id: 'app.components.FilterBoxes.all',
    defaultMessage: 'All',
  },
  areas: {
    id: 'app.components.FilterBoxes.areas',
    defaultMessage: 'Areas',
  },
  topicsTitle: {
    id: 'app.components.FilterBoxes.topicsTitle',
    defaultMessage: 'Topics',
  },
  a11y_numberOfInputs: {
    id: 'app.components.FilterBoxes.a11y_numberOfInputs',
    defaultMessage:
      '{inputsCount, plural, no {# inputs} one {# input} other {# inputs}}',
  },
  a11y_numberOfInitiatives: {
    id: 'app.components.FilterBoxes.a11y_numberOfInitiatives',
    defaultMessage:
      '{initiativeCount, plural, no {# initiatives} one {# initiative} other {# initiatives}}',
  },
  a11y_removeFilter: {
    id: 'app.components.FilterBoxes.a11y_removeFilter',
    defaultMessage: 'Remove filter',
  },
  a11y_allFilterSelected: {
    id: 'app.components.FilterBoxes.a11y_allFilterSelected',
    defaultMessage: 'Selected status filter: all',
  },
  a11y_selectedFilter: {
    id: 'app.components.FilterBoxes.a11y_selectedFilter',
    defaultMessage: 'Selected status filter: {filter}',
  },
  a11y_selectedTopicFilters: {
    id: 'app.components.FilterBoxes.a11y_selectedTopicFilters',
    defaultMessage:
      'Selected {numberOfSelectedTopics, plural, =0 {zero topic filters} one {one topic filter} other {# topic filters}}. {selectedTopicNames}',
  },
});
