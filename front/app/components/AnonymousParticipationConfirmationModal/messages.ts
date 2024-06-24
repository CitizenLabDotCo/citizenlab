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
      'This will safely <b>hide your profile</b> from admins, project managers and other residents for this specific contribution so that nobody is able to link this contribution to you. Anonymous contributions cannot be edited, and are considered final.',
  },
  participateAnonymouslyModalTextSection2: {
    id: 'app.components.anonymousParticipationModal.participateAnonymouslyModalTextSection2',
    defaultMessage:
      'Making our platform safe for every user is a top priority for us. Words matter, so please be kind to each other.',
  },
  anonymousParticipationWarning: {
    id: 'app.components.anonymousParticipationModal.anonymousParticipationWarning',
    defaultMessage: "You won't get notifications on your contribution",
  },
});
