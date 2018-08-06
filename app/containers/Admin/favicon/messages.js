/*
 * AdminPage.SettingsPage Messages
 *
 * This contains all the text for the AdminPage.SettingsPage component.
 */

import { defineMessages } from 'react-intl';

export default defineMessages({
  favicon: {
    id: 'app.containers.AdminPage.SettingsPage.favicon',
    defaultMessage: 'Favicon',
  },
  noFavicon: {
    id: 'app.containers.AdminPage.SettingsPage.noFavicon',
    defaultMessage: 'Please upload a favicon image',
  },
  save: {
    id: 'app.containers.AdminPage.SettingsPage.save',
    defaultMessage: 'Save',
  },
  saveSuccess: {
    id: 'app.containers.AdminPage.SettingsPage.saveSuccess',
    defaultMessage: 'Success!',
  },
  saveErrorMessage: {
    id: 'app.containers.AdminPage.SettingsPage.saveErrorMessage',
    defaultMessage: 'Something went wrong, please try again later.',
  },
  saveSuccessMessage: {
    id: 'app.containers.AdminPage.SettingsPage.saveSuccessMessage',
    defaultMessage: 'Your changes have been saved.',
  },
  faviconExplaination: {
    id: 'app.containers.AdminPage.SettingsPage.faviconExplaination',
    defaultMessage: 'It has to be a simple enough image to be seen in very little. It should be a square PNG. It can use transparency. If it doesn\'t, prefer a white background. This should be set once and changed as little as possible.',
  },
});
