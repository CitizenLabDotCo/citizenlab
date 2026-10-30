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
  inputs: {
    id: 'app.components.FilterBoxes.inputs',
    defaultMessage: 'inputs',
  },
  noValuesFound: {
    id: 'app.components.FilterBoxes.noValuesFound',
    defaultMessage: 'No values available.',
  },
  topicsTitle: {
    id: 'app.components.FilterBoxes.topicsTitle',
    defaultMessage: 'Topics',
  },
  showLess: {
    id: 'app.components.FilterBoxes.showLess',
    defaultMessage: 'Show less',
  },
  showTagsWithNumber: {
    id: 'app.components.FilterBoxes.showTagsWithNumber',
    defaultMessage: 'Show all ({numberTags})',
  },
  a11y_numberOfInputs: {
    id: 'app.components.FilterBoxes.a11y_numberOfInputs',
    defaultMessage:
      '{inputsCount, plural, no {# inputs} one {# input} other {# inputs}}',
  },
  a11y_removeFilter: {
    id: 'app.components.FilterBoxes.a11y_removeFilter',
    defaultMessage: 'Remove filter',
  },
  a11y_allSelected: {
    id: 'app.components.FilterBoxes.a11y_allSelected',
    defaultMessage: 'Selected {filter} filter: all',
  },
  a11y_selectedOption: {
    id: 'app.components.FilterBoxes.a11y_selectedOption',
    defaultMessage: 'Selected {filter} filter: {option}',
  },
  a11y_selectedTopicFilters: {
    id: 'app.components.FilterBoxes.a11y_selectedTopicFilters',
    defaultMessage:
      'Selected {numberOfSelectedTopics, plural, =0 {zero topic filters} one {one topic filter} other {# topic filters}}. {selectedTopicNames}',
  },
});
