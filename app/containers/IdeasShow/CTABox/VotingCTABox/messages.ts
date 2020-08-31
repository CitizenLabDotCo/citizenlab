import { defineMessages } from 'react-intl';

export default defineMessages({
  twitterMessage: {
    id: 'app.containers.IdeasShow.twitterMessage',
    defaultMessage: 'Vote for {ideaTitle} on',
  },
  emailSharingSubject: {
    id: 'app.containers.IdeasShow.emailSharingSubject',
    defaultMessage: 'Support my idea: {ideaTitle}.',
  },
  emailSharingBody: {
    id: 'app.containers.IdeasShow.emailSharingBody',
    defaultMessage:
      'What do you think of this idea? Vote on it and share the discussion at {ideaUrl} to make your voice heard!',
  },
});
