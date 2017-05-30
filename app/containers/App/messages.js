/*
 * App Messages
 *
 * This contains all the text for the App component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  loading: {
    id: 'app.containers.App.loading',
    defaultMessage: 'Loading...',
  },
  helmetTitle: {
    id: 'app.containers.App.helmetTitle',
    defaultMessage: 'Home page',
  },
  helmetDescription: {
    id: 'app.containers.App.helmetDescription',
    defaultMessage: 'Citizenlab 2 platform {tenantName}',
  },
});
