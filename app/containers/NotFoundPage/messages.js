/*
 * NotFoundPage Messages
 *
 * This contains all the text for the NotFoundPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.components.NotFoundPage.header',
    defaultMessage: 'Page not found!',
  },
  text: {
    id: 'app.components.NotFoundPage.text',
    defaultMessage: `We're really sorry but the requested page could not be found.`,
  },
  title: {
    id: 'app.components.NotFoundPage.meta.title',
    defaultMessage: 'Page not found',
  },
  description: {
    id: 'app.components.NotFoundPage.meta.description',
    defaultMessage: 'The requested page could not be found',
  },
});
