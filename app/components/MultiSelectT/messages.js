/*
 * TopicSelect Messages
 *
 * This contains all the text for the TopicSelect component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  selectionTooLong: {
    id: 'app.components.MultiSelect.selectionTooLong',
    defaultMessage: 'Too many {optionLabel} (max: {maxSelectionLength})',
  },
  noResultsMessage: {
    id: 'app.components.MultiSelect.noResultsMessage',
    defaultMessage: 'No results',
  },
});
