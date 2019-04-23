/*
 * IdeasIndexPage Messages
 *
 * This contains all the text for the IdeasIndexPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  // Modal when a user just deleted its profile
  userDeletedSuccessfullyTitle: {
    id: 'app.containers.landing.userDeletedSuccessfullyTitle',
    defaultMessage: 'Your profile has successfully been deleted'
  },
  userDeletedSuccessfullySubtitle: {
    id: 'app.containers.landing.userDeletedSuccessfullySubtitle',
    defaultMessage: 'We\'re sorry to see you go'
  },
  // header
  titleCity: {
    id: 'app.containers.landing.titleCity',
    defaultMessage: 'Change the future of {name}',
  },
  subtitleCity: {
    id: 'app.containers.landing.subtitleCity',
    defaultMessage: 'Start an idea!',
  },
  createAccount: {
    id: 'app.containers.landing.createAccount',
    defaultMessage: 'Create an account',
  },

  // ideas
  ideasFrom: {
    id: 'app.containers.landing.ideasFrom',
    defaultMessage: 'Ideas for {name}',
  },
  trendingIdeas: {
    id: 'app.containers.landing.trendingIdeas',
    defaultMessage: 'Trending ideas',
  },
  explore: {
    id: 'app.containers.landing.explore',
    defaultMessage: 'Explore',
  },
  exploreAllIdeas: {
    id: 'app.containers.landing.exploreAllIdeas',
    defaultMessage: 'Explore all ideas',
  },

  // projects
  projectsFrom: {
    id: 'app.containers.landing.projectsFrom',
    defaultMessage: 'Projects from {name}',
  },
  cityProjects: {
    id: 'app.containers.landing.cityProjects',
    defaultMessage: 'City projects',
  },
  exploreAllProjects: {
    id: 'app.containers.landing.exploreAllProjects',
    defaultMessage: 'Explore all projects',
  },
  shareTitle: {
    id: 'app.containers.landing.shareTitle',
    defaultMessage: 'Congratulations, your idea was successfully posted!',
  },
  shareSubtitle: {
    id: 'app.containers.landing.shareSubtitle',
    defaultMessage: 'Share your idea to reach more people, receive more votes and have more impact.',
  },
  twitterMessage: {
    id: 'app.containers.landing.twitterMessage',
    defaultMessage: 'Vote for {ideaTitle} on',
  },
  emailSharingSubject: {
    id: 'app.containers.landing.emailSharingSubject',
    defaultMessage: 'Support my idea: {ideaTitle}.',
  },
  emailSharingBody: {
    id: 'app.containers.landing.emailSharingBody',
    defaultMessage: 'What do you think of this idea? Vote on it and share the discussion at {ideaUrl} to make your voice heard!',
  },
  completeYourProfile: {
    id: 'app.containers.landing.completeYourProfile',
    defaultMessage: `Welcome {firstName}. It's time to complete your profile.`,
  },
  completeProfile: {
    id: 'app.containers.landing.completeProfile',
    defaultMessage: `Complete profile`,
  },
  doItLater: {
    id: 'app.containers.landing.doItLater',
    defaultMessage: `I'll do it later`,
  },
  defaultSignedInMessage: {
    id: 'app.containers.landing.defaultSignedInMessage',
    defaultMessage: `{firstName}, inspire change today!`,
  }
});
