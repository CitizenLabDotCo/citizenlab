import { defineMessages } from 'react-intl';

export default defineMessages({
  learnMore: {
    id: 'app.containers.InitiativesShow.learnMore',
    defaultMessage: 'Learn more about initiatives',
  },
  postedBy: {
    id: 'app.containers.InitiativesShow.postedBy',
    defaultMessage: 'Initiative posted by {authorName}',
  },
  twitterMessage: {
    id: 'app.containers.InitiativesShow.twitterMessage',
    defaultMessage: 'Vote for {initiativeTitle} on',
  },
  emailSharingSubject: {
    id: 'app.containers.InitiativesShow.emailSharingSubject',
    defaultMessage: 'Support my idea: {initiativeTitle}.',
  },
  emailSharingBody: {
    id: 'app.containers.InitiativesShow.emailSharingBody',
    defaultMessage: 'What do you think of this idea? Vote on it and share the discussion at {initiativeUrl} to make your voice heard!',
  },
});
