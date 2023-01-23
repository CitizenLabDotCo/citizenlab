import { defineMessages } from 'react-intl';

export default defineMessages({
  userVerifiedTitle: {
    id: 'app.components.VerificationModal.userVerifiedTitle',
    defaultMessage: 'You’re now verified !',
  },
  userVerifiedSubtitle: {
    id: 'app.components.VerificationModal.userVerifiedSubtitle',
    defaultMessage:
      'Your identity has been verified. You’re now a full member of the community on this platform.',
  },
  errorTitle: {
    id: 'app.components.VerificationModal.errorTitle',
    defaultMessage: 'There was an issue with the verification of your account',
  },
  errorTakenSubtitle: {
    id: 'app.components.VerificationModal.errorTakenSubtitle',
    defaultMessage:
      'Verification failed because another account is already using this identity.',
  },
  errorNotEntitledSubtitle: {
    id: 'app.components.VerificationModal.errorNotEntitledSubtitle',
    defaultMessage:
      "Your identity has been found, but it doesn't have enough civil rights to be considered verified",
  },
  errorGenericSubtitle: {
    id: 'app.components.VerificationModal.errorGenericSubtitle',
    defaultMessage:
      'There was an unkown issue with the verification of your account, please try again.',
  },
  close: {
    id: 'app.components.VerificationModal.close',
    defaultMessage: 'Close',
  },
});
