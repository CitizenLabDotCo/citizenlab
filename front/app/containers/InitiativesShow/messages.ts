import { defineMessages } from 'react-intl';

export default defineMessages({
  metaTitle: {
    id: 'app.containers.InitiativesShow.metaTitle',
    defaultMessage: 'Initiative: {initiativeTitle}',
  },
  invisibleTitleContent: {
    id: 'app.containers.InitiativesShow.invisibleTitleContent',
    defaultMessage: 'What is this initiative about?',
  },
  metaOgTitle: {
    id: 'app.containers.InitiativesShow.metaOgTitle',
    defaultMessage: 'Support this initiative: {initiativeTitle}',
  },
  initiativeOgDescription: {
    id: 'app.containers.InitiativesShow.initiativeOgDescription',
    defaultMessage:
      'What do you think of this initiative? Join the discussion and vote to make your voice heard.',
  },
  learnMore: {
    id: 'app.containers.InitiativesShow.learnMore',
    defaultMessage: 'Learn more about initiatives',
  },
  postedBy: {
    id: 'app.containers.InitiativesShow.postedBy',
    defaultMessage: 'Initiative posted by {authorName}',
  },
  postedByShort: {
    id: 'app.containers.InitiativesShow.postedByShort',
    defaultMessage: 'Posted by {authorName}',
  },
  twitterMessage: {
    id: 'app.containers.InitiativesShow.twitterMessage',
    defaultMessage: 'Vote for {initiativeTitle} on',
  },
  facebookMessage: {
    id: 'app.containers.InitiativesShow.facebookMessage',
    defaultMessage: 'Vote for {initiativeTitle} on',
  },
  whatsAppMessage: {
    id: 'app.containers.InitiativesShow.whatsAppMessage',
    defaultMessage:
      '{initiativeTitle} | from the participation platform of {orgName}',
  },
  emailSharingSubject: {
    id: 'app.containers.InitiativesShow.emailSharingSubject',
    defaultMessage: 'Support my initiative: {initiativeTitle}.',
  },
  emailSharingBody: {
    id: 'app.containers.InitiativesShow.emailSharingBody',
    defaultMessage:
      'What do you think of this initiative? Vote on it and share the discussion at {initiativeUrl} to make your voice heard!',
  },
  allInitiatives: {
    id: 'app.containers.InitiativesShow.allInitiatives',
    defaultMessage: 'All Initiatves',
  },
  moreOptions: {
    id: 'app.components.InitiativesShow.moreOptions',
    defaultMessage: 'More options',
  },
  reportAsSpam: {
    id: 'app.components.InitiativesShow.reportAsSpam',
    defaultMessage: 'Report as spam',
  },
  editInitiative: {
    id: 'app.components.InitiativesShow.editInitiative',
    defaultMessage: 'Edit initiative',
  },
  deleteInitiative: {
    id: 'app.components.InitiativesShow.deleteInitiative',
    defaultMessage: 'Delete initiative',
  },
  deleteInitiativeConfirmation: {
    id: 'app.components.InitiativesShow.deleteInitiativeConfirmation',
    defaultMessage: 'Are you sure you want to delete this initiative?',
  },
  reportAsSpamModalTitle: {
    id: 'app.containers.InitiativesShow.reportAsSpamModalTitle',
    defaultMessage: 'Why do you want to report this as spam?',
  },
  skipSharing: {
    id: 'app.components.InitiativesShow.skipSharing',
    defaultMessage: "Skip it, I'll do it later",
  },
  shareTitle: {
    id: 'app.components.InitiativesShow.shareTitle',
    defaultMessage: 'Congratulations, your proposal was successfully posted!',
  },
  shareSubtitle: {
    id: 'app.components.InitiativesShow.shareSubtitle',
    defaultMessage:
      'Share your proposal to reach {votingThreshold} votes in {daysLimit} days.',
  },
  createdModalTitle: {
    id: 'app.components.InitiativesShow.createdModalTitle',
    defaultMessage:
      'Congratulations, your proposal has been submitted for review!',
  },
  createdModalSubtitle: {
    id: 'app.components.InitiativesShow.createdModalSubtitle',
    defaultMessage:
      'An admin will review your proposal shortly - you will be notified when the review is completed.',
  },
  a11y_voteControl: {
    id: 'app.containers.InitiativesShow.a11y_voteControl',
    defaultMessage: 'Voting and status',
  },
  cosponsorshipSuccess: {
    id: 'app.containers.InitiativesShow.cosponsorshipSuccess',
    defaultMessage: "You've succesfully cosponsored this proposal!",
  },
  titleCosponsorsTile: {
    id: 'app.containers.InitiativesShow.titleCosponsorsTile',
    defaultMessage: 'Cosponsors of this proposal',
  },
  youWereInvitedToConsponsorBy: {
    id: 'app.containers.InitiativesShow.youWereInvitedToConsponsorBy',
    defaultMessage: '{authorName} invited you to cosponsor this proposal.',
  },
  cosponsorRequirementInfo: {
    id: 'app.containers.InitiativesShow.cosponsorRequirementInfo',
    defaultMessage:
      '{requiredNumberOfCosponsors, plural, one {At least 1 person needs to cosponsor for the proposal to be considered.} other {At least # people need to cosponsor for the proposal to be considered.}}',
  },
  cosponsor: {
    id: 'app.containers.InitiativesShow.cosponsor',
    defaultMessage: 'Cosponsor',
  },
  cosponsorCTA: {
    id: 'app.containers.InitiativesShow.cosponsorCTA',
    defaultMessage: 'Cosponsor this proposal',
  },
  manageInvitationsLinkText: {
    id: 'app.containers.InitiativesShow.manageInvitationsLinkText',
    defaultMessage: 'Manage cosponsorship invitations',
  },
  numberOfCosponsorsNotYetMet: {
    id: 'app.containers.InitiativesShow.numberOfCosponsorsNotYetMet',
    defaultMessage:
      '{requiredNumberOfCosponsors, plural, one {Your proposal needs 1 accepted cosponsorship. Until then, it will not be considered. {manageInvitationsLink}.} other {Your proposal needs {requiredNumberOfCosponsors} accepted cosponsorships. Until then, it will not be considered. {manageInvitationsLink}.}}',
  },
  pending: {
    id: 'app.containers.InitiativesShow.pending1',
    defaultMessage: 'pending',
  },
});
