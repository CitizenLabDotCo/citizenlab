import { defineMessages } from 'react-intl';

export default defineMessages({
  customized_button: {
    id: 'app.containers.AdminPage.SettingsPage.customized_button',
    defaultMessage: 'Custom',
  },
  no_button: {
    id: 'app.containers.AdminPage.SettingsPage.no_button',
    defaultMessage: 'No button',
  },
  signed_in: {
    id: 'app.containers.AdminPage.SettingsPage.signed_in',
    defaultMessage: 'Button for registered visitors',
  },
  customized_button_text_label: {
    id: 'app.containers.AdminPage.SettingsPage.customized_button_text_label',
    defaultMessage: 'Button text',
  },
  customized_button_url_label: {
    id: 'app.containers.AdminPage.SettingsPage.customized_button_url_label',
    defaultMessage: 'Button link',
  },
  customPageCtaButtonTextError: {
    id: 'app.containers.AdminPage.SettingsPage.customPageCtaButtonTextError',
    defaultMessage: 'Enter a button text.',
  },
  customPageCtaButtonUrlError: {
    id: 'app.containers.AdminPage.SettingsPage.customPageCtaButtonUrlError',
    defaultMessage:
      "Enter a valid button link. Make sure the link starts with 'https://'.",
  },
});
