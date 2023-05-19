import { defineMessages } from 'react-intl';

export default defineMessages({
  continue: {
    id: 'app.components.anonymousParticipationModal.continue',
    defaultMessage: 'Continue',
  },
  cancel: {
    id: 'app.components.anonymousParticipationModal.cancel',
    defaultMessage: 'Cancel',
  },
  participateAnonymously: {
    id: 'app.components.anonymousParticipationModal.participateAnonymously',
    defaultMessage: 'Participate anonymously',
  },
  participateAnonymouslyModalText: {
    id: 'app.components.anonymousParticipationModal.participateAnonymouslyModalText',
    defaultMessage:
      'This will safely <b>hide your profile</b> from admins, moderators and other residents on this specific contribution, blocking anyone from linking this contribution to yourself.',
  },
  anonymousParticipationWarning: {
    id: 'app.components.anonymousParticipationModal.anonymousParticipationWarning',
    defaultMessage: "You won't get notifications on your contribution",
  },
});
