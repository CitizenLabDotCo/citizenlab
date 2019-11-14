import { defineMessages } from 'react-intl';

export default defineMessages({
  twitterMessage: {
    id: 'app.components.PostShowComponents.SharingModalContent.twitterMessage',
    defaultMessage: 'Vote for {postTitle} on',
  },
  ideaEmailSharingSubject: {
    id: 'app.components.PostShowComponents.SharingModalContent.ideaEmailSharingSubject',
    defaultMessage: 'Support my idea: {postTitle}.',
  },
  initiativeEmailSharingSubject: {
    id: 'app.components.PostShowComponents.SharingModalContent.initiativeEmailSharingSubject',
    defaultMessage: 'Support my initiative: {postTitle}.',
  },
  ideaEmailSharingBody: {
    id: 'app.components.PostShowComponents.SharingModalContent.ideaEmailSharingBody',
    defaultMessage: 'What do you think of this idea? Vote on it and share the discussion at {postUrl} to make your voice heard!',
  },
  initiativeEmailSharingBody: {
    id: 'app.components.PostShowComponents.SharingModalContent.initiativeEmailSharingBody',
    defaultMessage: 'What do you think of this initiative? Vote on it and share the discussion at {postUrl} to make your voice heard!',
  },
});
