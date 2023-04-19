import { defineMessages } from 'react-intl';

export default defineMessages({
  codeMustHaveFourDigits: {
    id: 'app.containers.NewAuthModal.steps.EmailConfirmation.codeMustHaveFourDigits',
    defaultMessage: 'Code must have 4 digits.',
  },
  anExampleCodeHasBeenSent: {
    id: 'app.components.ConfirmationModal.anExampleCodeHasBeenSent',
    defaultMessage:
      'An email with a confirmation code has been sent to {userEmail}.',
  },
  confirmationCodeSent: {
    id: 'app.components.ConfirmationModal.confirmationCodeSent',
    defaultMessage: 'New code sent',
  },
  didntGetAnEmail: {
    id: 'app.components.ConfirmationModal.didntGetAnEmail',
    defaultMessage: "Didn't receive an email?",
  },
  wrongEmail: {
    id: 'app.components.ConfirmationModal.wrongEmail',
    defaultMessage: 'Wrong email?',
  },
  sendNewCode: {
    id: 'app.components.ConfirmationModal.sendNewCode',
    defaultMessage: 'Send New Code.',
  },
  changeYourEmail: {
    id: 'app.components.ConfirmationModal.changeYourEmail',
    defaultMessage: 'Change your email.',
  },
  verifyAndContinue: {
    id: 'app.components.ConfirmationModal.verifyAndContinue',
    defaultMessage: 'Verify and Continue',
  },
  codeInput: {
    id: 'app.components.ConfirmationModal.codeInput',
    defaultMessage: 'Code',
  },
});
