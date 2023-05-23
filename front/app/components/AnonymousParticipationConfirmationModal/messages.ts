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
    id: 'app.components.anonymousParticipationModal.participateAnonymouslyModalText2',
    defaultMessage:
      "You selected 'Post anonymously'. This will safely <b>hide your profile</b> from admins, moderators and other residents for this specific contribution so that nobody is able to link this contribution to you",
  },
  anonymousParticipationWarning: {
    id: 'app.components.anonymousParticipationModal.anonymousParticipationWarning',
    defaultMessage: "You won't get notifications on your contribution",
  },
});
