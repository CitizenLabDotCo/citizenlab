import { defineMessages } from 'react-intl';

export default defineMessages({
  startAnIdea: {
    id: 'app.containers.IdeaButton.startAnIdea',
    defaultMessage: 'Start an idea',
  },
  postingHereImpossible: {
    id: 'app.containers.IdeaButton.postingHereImpossible',
    defaultMessage: 'Posting an idea here is currently impossible.',
  },
  postingNotPermitted: {
    id: 'app.containers.IdeaButton.postingNotPermitted',
    defaultMessage:
      "Unfortunately, You don't have the rights to post ideas here.",
  },
  postingMaybeNotPermitted: {
    id: 'app.containers.IdeaButton.postingMaybeNotPermitted',
    defaultMessage:
      'Only certain users can post ideas here. Please sign in first.',
  },
  signInLinkText: {
    id: 'app.containers.IdeaButton.signInLinkText',
    defaultMessage: 'sign in',
  },
  signUpLinkText: {
    id: 'app.containers.IdeaButton.signUpLinkText',
    defaultMessage: 'sign up',
  },
  postingProjectInactive: {
    id: 'app.containers.IdeaButton.postingProjectInactive',
    defaultMessage: 'This project is not yet or no longer accepting new ideas.',
  },
  postingNotActivePhase: {
    id: 'app.containers.IdeaButton.postingNotActivePhase',
    defaultMessage: "You can't post ideas in a past or future phase.",
  },
  postingNotVerified: {
    id: 'app.containers.IdeaButton.postingNotVerified',
    defaultMessage:
      'You need to verify your account to post an idea here. {verificationLink}',
  },
  verificationLinkText: {
    id: 'app.containers.IdeaButton.verificationLinkText',
    defaultMessage: 'Verify your account now.',
  },
});
