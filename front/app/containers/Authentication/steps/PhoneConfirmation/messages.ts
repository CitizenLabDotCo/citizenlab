import { defineMessages } from 'react-intl';

export default defineMessages({
  codeMustHaveFourDigits: {
    id: 'app.containers.PhoneConfirmation.codeMustHaveFourDigits',
    defaultMessage: 'Code must have 4 digits.',
  },
  anSMSCodeHasBeenSent: {
    id: 'app.containers.PhoneConfirmation.anSMSCodeHasBeenSent',
    defaultMessage:
      'An SMS with a confirmation code has been sent to {phoneNumber}.',
  },
  confirmationCodeSent: {
    id: 'app.containers.PhoneConfirmation.confirmationCodeSent',
    defaultMessage: 'New code sent',
  },
  didntGetAnSMS: {
    id: 'app.containers.PhoneConfirmation.didntGetAnSMS',
    defaultMessage: "Didn't receive an SMS?",
  },
  wrongNumber: {
    id: 'app.containers.PhoneConfirmation.wrongNumber',
    defaultMessage: 'Wrong number?',
  },
  sendNewCode: {
    id: 'app.containers.PhoneConfirmation.sendNewCode',
    defaultMessage: 'Send New Code.',
  },
  changeYourNumber: {
    id: 'app.containers.PhoneConfirmation.changeYourNumber',
    defaultMessage: 'Change your number.',
  },
  verifyAndContinue: {
    id: 'app.containers.PhoneConfirmation.verifyAndContinue',
    defaultMessage: 'Verify and Continue',
  },
  codeInput: {
    id: 'app.containers.PhoneConfirmation.codeInput',
    defaultMessage: 'Code',
  },
});
