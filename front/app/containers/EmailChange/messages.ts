import { defineMessages } from 'react-intl';

export default defineMessages({
  emailRequired: {
    id: 'app.containers.ChangeEmail.emailRequired',
    defaultMessage: 'Please enter an email address.',
  },
  helmetTitle: {
    id: 'app.containers.ChangeEmail.helmetTitle',
    defaultMessage: 'Change your email',
  },
  helmetDescription: {
    id: 'app.containers.ChangeEmail.helmetDescription',
    defaultMessage: 'Change your email page',
  },
  titleChangeEmail: {
    id: 'app.containers.ChangeEmail.titleChangeEmail',
    defaultMessage: 'Change your email',
  },
  titleAddEmail: {
    id: 'app.containers.ChangeEmail.titleAddEmail',
    defaultMessage: 'Add your email',
  },
  submitButton: {
    id: 'app.containers.ChangeEmail.submitButton',
    defaultMessage: 'Submit',
  },
  newEmailLabel: {
    id: 'app.containers.ChangeEmail.newEmailLabel',
    defaultMessage: 'New email',
  },
  emailEmptyError: {
    id: 'app.containers.ChangeEmail.emailEmptyError',
    defaultMessage: 'Provide an e-mail address',
  },
  emailInvalidError: {
    id: 'app.containers.ChangeEmail.emailInvalidError',
    defaultMessage:
      'Provide an email address in the correct format, for example name@provider.com',
  },
  updateSuccessful: {
    id: 'app.containers.ChangeEmail.updateSuccessful',
    defaultMessage: 'Your email has been successfully updated.',
  },
  confirmationModalTitle: {
    id: 'app.containers.ChangeEmail.confirmationModalTitle',
    defaultMessage: 'Confirm your email',
  },
  emailTaken: {
    id: 'app.containers.ChangeEmail.emailTaken',
    defaultMessage: 'This email is already in use.',
  },
  emailUpdateCancelled: {
    id: 'app.containers.ChangeEmail.emailUpdateCancelled',
    defaultMessage: 'Email update has been cancelled.',
  },
  emailUpdateCancelledDescription: {
    id: 'app.containers.ChangeEmail.emailUpdateCancelledDescription',
    defaultMessage: 'To update your email, please restart the process.',
  },
  backToProfile: {
    id: 'app.containers.ChangeEmail.backToProfile',
    defaultMessage: 'Back to profile settings',
  },
  adminEmailChangeWarning: {
    id: 'app.containers.ChangeEmail.adminEmailChangeWarning2',
    defaultMessage:
      'Changing your email address will sign you out in other browsers you are also signed into. You will lose any unsaved changes.',
  },
  currentEmail: {
    id: 'app.containers.ChangeEmail.currentEmail',
    defaultMessage: 'Your current email address is {email}.',
  },
  noEmail: {
    id: 'app.containers.ChangeEmail.noEmail',
    defaultMessage: 'You currently have no email address saved.',
  },
});
