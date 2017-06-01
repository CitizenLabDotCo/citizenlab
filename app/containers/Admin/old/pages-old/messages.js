/*
 * AdminPages Messages
 *
 * This contains all the text for the AdminPages component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  loading: {
    id: 'app.containers.AdminPages.loading',
    defaultMessage: 'Loading...',
  },
  loadError: {
    id: 'app.containers.AdminPages.loadError',
    defaultMessage: 'Couldn\' load pages',
  },
  page: {
    id: 'app.containers.AdminPages.page',
    defaultMessage: 'Page',
  },
  noPages: {
    id: 'app.containers.AdminPages.noPages',
    defaultMessage: 'No pages',
  },
  helmetTitle: {
    id: 'app.containers.AdminPages.helmetTitle',
    defaultMessage: 'Admin pages',
  },
  helmetDescription: {
    id: 'app.containers.AdminPages.helmetDescription',
    defaultMessage: 'List of pages published on the platform by admin',
  },
});
