/*
 * CampaignsConsent Messages
 *
 * This contains all the text for the UsersEditPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  buttonSuccessLabel: {
    id: 'app.containers.CampaignsConsentForm.buttonSuccessLabel',
    defaultMessage: 'Success',
  },
  messageError: {
    id: 'app.containers.CampaignsConsentForm.messageError',
    defaultMessage: 'There was an error saving your email preferences.',
  },
  messageSuccess: {
    id: 'app.containers.CampaignsConsentForm.messageSuccess',
    defaultMessage: 'Your email preferences have been saved.',
  },
  /*
   * Notifications
   */
  submit: {
    id: 'app.containers.CampaignsConsentForm.submit',
    defaultMessage: 'Save',
  },
  notificationsTitle: {
    id: 'app.containers.CampaignsConsentForm.notificationsTitle',
    defaultMessage: 'Notifications',
  },
  notificationsSubTitle: {
    id: 'app.containers.CampaignsConsentForm.notificationsSubTitle',
    defaultMessage: 'When do you want us to send you an email to notify you?',
  },
});
