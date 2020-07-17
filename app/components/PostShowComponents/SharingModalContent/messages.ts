import { defineMessages } from 'react-intl';

export default defineMessages({
  twitterMessage: {
    id: 'app.components.PostComponents.SharingModalContent.twitterMessage',
    defaultMessage: 'Vote for {postTitle} on',
  },
  ideaEmailSharingSubject: {
    id:
      'app.components.PostComponents.SharingModalContent.ideaEmailSharingSubject',
    defaultMessage: 'Support my idea: {postTitle}.',
  },
  initiativeEmailSharingSubject: {
    id:
      'app.components.PostComponents.SharingModalContent.initiativeEmailSharingSubject',
    defaultMessage: 'Support my initiative: {postTitle}.',
  },
  ideaEmailSharingBody: {
    id:
      'app.components.PostComponents.SharingModalContent.ideaEmailSharingBody',
    defaultMessage:
      'What do you think of this idea? Vote on it and share the discussion at {postUrl} to make your voice heard!',
  },
  initiativeEmailSharingBody: {
    id:
      'app.components.PostComponents.SharingModalContent.initiativeEmailSharingBody',
    defaultMessage:
      'What do you think of this initiative? Vote on it and share the discussion at {postUrl} to make your voice heard!',
  },
});
