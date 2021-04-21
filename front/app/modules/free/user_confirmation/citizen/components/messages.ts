import { defineMessages } from 'react-intl';

export default defineMessages({
  confirmYourAccount: {
    id: 'app.components.ConfirmationModal.confirmYourAccount',
    defaultMessage: 'Confirm your Email Address',
  },
  anExampleCodeHasBeenSent: {
    id: 'app.components.ConfirmationModal.anExampleCodeHasBeenSent',
    defaultMessage:
      'An email with a confirmation code has been sent to {userEmail}. Please enter the code here:',
  },
  close: {
    id: 'app.components.VerificationModal.close',
    defaultMessage: 'Close',
  },
  verifyAndContinue: {
    id: 'app.components.ConfirmationModal.verifyAndContinue',
    defaultMessage: 'Verify and Continue',
  },
  cancel: {
    id: 'app.components.VerificationModal.cancel',
    defaultMessage: 'Cancel',
  },
  wrongEmail: {
    id: 'app.components.ConfirmationModal.wrongEmail',
    defaultMessage: 'Wrong email?',
  },
  didntGetAnEmail: {
    id: 'app.components.VerificationModal.didntGetAnEmail',
    defaultMessage: "Didn't receive an email?",
  },
  goBackToThePreviousStep: {
    id: 'app.components.ConfirmationModal.goBackToThePreviousStep',
    defaultMessage: 'Go back to the previous step.',
  },
  sendNewCode: {
    id: 'app.components.VerificationModal.sendNewCode',
    defaultMessage: 'Send New Code.',
  },
});
