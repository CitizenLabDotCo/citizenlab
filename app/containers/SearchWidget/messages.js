/*
 * SearchWidget Messages
 *
 * This contains all the text for the Search component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  noResultsMessage: {
    id: 'app.containers.SearchWidget.noResultsMessage',
    defaultMessage: 'No results',
  },
  waitingForInput: {
    id: 'app.containers.SearchWidget.waitingForInput',
    defaultMessage: 'Results will be displayed after typing ends...',
  },
});
