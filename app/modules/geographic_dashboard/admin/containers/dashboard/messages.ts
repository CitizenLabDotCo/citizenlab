/*
 * AdminPage.DashboardPage Messages
 *
 * This contains all the text for the AdminPage.DashboardPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  mapExplanationText: {
    id: 'app.containers.AdminPage.DashboardPage.mapExplanationText',
    defaultMessage:
      'This map automatically detects locations from the title and description of the input. The location data may not be accurate; inputs where no locational data is detected are not displayed.',
  },
  automaticLoadingMessage: {
    id: 'app.containers.AdminPage.DashboardPage.automaticLoadingMessage',
    defaultMessage:
      'Automatic location detection underway. Please wait until the processing is complete.',
  },
  thenLoadingMessage: {
    id: 'app.containers.AdminPage.DashboardPage.thenLoadingMessage',
    defaultMessage:
      'Fun Fact: it will probably be way faster the next time you come here!',
  },
  lastLoadingMessage: {
    id: 'app.containers.AdminPage.DashboardPage.lastLoadingMessage',
    defaultMessage: 'It should be almost ready, hang on!',
  },
});
