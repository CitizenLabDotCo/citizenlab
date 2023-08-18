import { defineMessages } from 'react-intl';

export default defineMessages({
  metaTitle: {
    id: 'app.containers.InitiativesIndexPage.metaTitle',
    defaultMessage: 'All Initiatives • {orgName}',
  },
  invisibleTitleInitiativeCards: {
    id: 'app.containers.InitiativesIndexPage.invisibleTitleInitiativeCards',
    defaultMessage: 'All the initiatives taking place in {orgName}',
  },
  invisibleInitiativesPageTitle: {
    id: 'app.containers.InitiativesIndexPage.invisibleInitiativesPageTitle',
    defaultMessage: 'Discover Initiatives',
  },
  metaDescription: {
    id: 'app.containers.InitiativesIndexPage.metaDescription',
    defaultMessage: 'Explore and support initiatives conducted in {orgName}',
  },
  header: {
    id: 'app.containers.InitiativesIndexPage.header',
    defaultMessage:
      'Start your own initiative and make your voice heard by {styledOrgName}',
  },
  headerPostingProposalDisabled: {
    id: 'app.containers.InitiativesIndexPage.headerPostingProposalDisabled',
    defaultMessage: 'Explore citizen proposals for {styledOrgName}',
  },
  learnMoreAboutProposals: {
    id: 'app.containers.InitiativesIndexPage.learnMoreAboutProposals',
    defaultMessage: 'Learn more about how proposals work.',
  },
  explanationTitle: {
    id: 'app.containers.InitiativesIndexPage.explanationTitle',
    defaultMessage: 'How do initiatives work?',
  },
  constraints: {
    id: 'app.containers.InitiativesIndexPage.constraints',
    defaultMessage: '{voteThreshold} votes within {daysLimit} days',
  },
  explanationContent: {
    id: 'app.containers.InitiativesIndexPage.explanationContent',
    defaultMessage:
      'Want to submit a proposal to {orgName}? Curious whether other people would support it? Post your proposal here and if it gets {constraints} votes within 90 days, {orgName} will get back to you. {link}',
  },
  success: {
    id: 'app.containers.InitiativesIndexPage.success',
    defaultMessage: 'success',
  },
  footer: {
    id: 'app.containers.InitiativesIndexPage.footer',
    defaultMessage: 'Start your own initiative and make your voice heard',
  },
  newProposalsNotPermitted: {
    id: 'app.containers.InitiativesIndexPage.newProposalsNotPermitted',
    defaultMessage: 'New proposals are not currently being accepted.',
  },
});
