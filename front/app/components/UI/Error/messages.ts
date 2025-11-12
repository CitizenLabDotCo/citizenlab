import { defineMessages } from 'react-intl';

export default defineMessages({
  confirmation_code_invalid: {
    id: 'app.errors.confirmation_code_invalid',
    defaultMessage:
      "Wrong code. Please check your email for the correct code or try 'Send New Code'",
  },

  resending_code_failed: {
    id: 'app.errors.resending_code_failed',
    defaultMessage:
      'Something went wrong while sending out the confirmation code.',
  },

  // field errors

  url: {
    id: 'app.errors.url',
    defaultMessage:
      'Enter a valid link. Make sure the link starts with https://',
  },

  verification_taken: {
    id: 'app.errors.verification_taken',
    defaultMessage:
      'Verification cannot be completed as another account has been verified using the same details.',
  },
});
