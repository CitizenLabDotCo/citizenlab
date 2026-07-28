import { defineMessages } from 'react-intl';

export default defineMessages({
  enterYourPhoneNumber: {
    id: 'app.containers.Authentication.steps.Phone.enterYourPhoneNumber',
    defaultMessage: 'Enter your phone number to continue.',
  },
  phoneNumber: {
    id: 'app.containers.Authentication.steps.Phone.phoneNumber',
    defaultMessage: 'Phone number',
  },
  phoneNumberFormatError: {
    id: 'app.containers.Authentication.steps.Phone.phoneNumberFormatError',
    defaultMessage:
      'Provide a phone number in the correct format, for example +32 470 12 34 56',
  },
  phoneNumberMissingError: {
    id: 'app.containers.Authentication.steps.Phone.phoneNumberMissingError',
    defaultMessage: 'Provide a phone number',
  },
});
