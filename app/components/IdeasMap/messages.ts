import { defineMessages } from 'react-intl';

export default defineMessages({
  seeIdea: {
    id: 'app.components.IdeasMap.seeIdea',
    defaultMessage: 'See the full idea',
  },
  noIdeasWithLocation: {
    id: 'app.components.IdeasMap.noIdeasWithLocation',
    defaultMessage:
      "The ideas in this project don't have any location information.",
  },
  postingHereImpossible: {
    id: 'app.components.IdeasMap.postingHereImpossible',
    defaultMessage: 'Posting an idea here is currently impossible.',
  },
  postingNotPermitted: {
    id: 'app.components.IdeasMap.postingNotPermitted',
    defaultMessage:
      "Unfortunately, You don't have the rights to post ideas here.",
  },
  postingMaybeNotPermitted: {
    id: 'app.components.IdeasMap.postingMaybeNotPermitted',
    defaultMessage:
      'Only certain users can post ideas here. Please {signUpLink} or {signInLink} first.',
  },
  signUpLinkText: {
    id: 'app.components.IdeasMap.signUpLinkText',
    defaultMessage: 'sign up',
  },
  signInLinkText: {
    id: 'app.components.IdeasMap.signInLinkText',
    defaultMessage: 'sign in',
  },
  postingProjectInactive: {
    id: 'app.components.IdeasMap.postingProjectInactive',
    defaultMessage: 'This project is not yet or no longer accepting new ideas.',
  },
  postingNotActivePhase: {
    id: 'app.components.IdeasMap.postingNotActivePhase',
    defaultMessage: "You can't post ideas in a past or future phase.",
  },
  mapTitle: {
    id: 'app.components.IdeasMap.mapTitle',
    defaultMessage: 'Map with overview of ideas based on location',
  },
  or: {
    id: 'app.components.IdeasMap.or',
    defaultMessage: 'or',
  },
});
