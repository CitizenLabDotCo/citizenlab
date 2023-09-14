import { defineMessages } from 'react-intl';

export default defineMessages({
  metaTitle: {
    id: 'app.containers.Admin.initiatives.metaTitle',
    defaultMessage: 'Admin initiatives page',
  },
  metaDescription: {
    id: 'app.containers.Admin.initiatives.metaDescription',
    defaultMessage: 'Manage initiatives on your platform',
  },
  titleInitiatives: {
    id: 'app.containers.Admin.initiatives.titleInitiatives',
    defaultMessage: 'Initiatives',
  },
  settingsTab: {
    id: 'app.containers.Admin.initiatives.settingsTab',
    defaultMessage: 'Settings',
  },
  settingsTabTitle: {
    id: 'app.containers.Admin.initiatives.settingsTabTitle',
    defaultMessage: 'Configure your proposals',
  },
  subtitleDescription: {
    id: 'app.containers.Admin.initiatives.subtitleDescription',
    defaultMessage:
      'View the submitted proposals, change their status and add tags for easier filtering and categorization.',
  },
  warningTresholdSettings: {
    id: 'app.containers.Admin.initiatives.warningTresholdSettings',
    defaultMessage: 'Changing this will impact all active proposals',
  },
  requireReviewLabel: {
    id: 'app.containers.Admin.initiatives.requireReviewLabel',
    defaultMessage: 'Require review of proposals',
  },
  requireReviewTooltip: {
    id: 'app.containers.Admin.initiatives.requireReviewTooltip',
    defaultMessage:
      "It's impossible to edit proposals once they're reviewed and approved",
  },
  requireCosponsorsLabel: {
    id: 'app.containers.Admin.initiatives.requireCosponsorsLabel',
    defaultMessage: 'Require cosponsors per proposal',
  },
  requireCosponsorsInfo: {
    id: 'app.containers.Admin.initiatives.requireCosponsorsInfo1',
    defaultMessage:
      "Proposals won't be visible until a number of cosponsors has been reached.",
  },
  cosponsorsNumberLabel: {
    id: 'app.containers.Admin.initiatives.cosponsorsNumberLabel',
    defaultMessage: 'Number of cosponsors',
  },
  cosponsorsNumberMinError: {
    id: 'app.containers.Admin.initiatives.cosponsorsNumberMinError1',
    defaultMessage: 'The number of cosponsors needs to be at least 1.',
  },
  requireReviewInfo: {
    id: 'app.containers.Admin.initiatives.requireReviewInfo1',
    defaultMessage:
      "Proposals won't be visible until an admin reviews and approves them.",
  },
  numberOfVotesThreshold: {
    id: 'app.containers.Admin.initiatives.numberOfVotesThreshold',
    defaultMessage: 'Minimum number of votes to be considered',
  },
  numberOfDaysThreshold: {
    id: 'app.containers.Admin.initiatives.numberOfDaysThreshold',
    defaultMessage: 'Number of days to reach minimum number of votes',
  },
  postingTips: {
    id: 'app.containers.Admin.initiatives.postingTips',
    defaultMessage: 'Posting tips',
  },
  postingTipsInfo: {
    id: 'app.containers.Admin.initiatives.postingTipsInfo',
    defaultMessage: 'Give some specific tips for posting a proposal',
  },
  proposalEligibilityCriteria: {
    id: 'app.containers.Admin.initiatives.proposalEligibilityCriteria',
    defaultMessage: 'Eligibility criteria',
  },
  proposalEligibilityCriteriaInfo: {
    id: 'app.containers.Admin.initiatives.proposalEligibilityCriteriaInfo',
    defaultMessage:
      "Give a clear description of the criteria you'll use to decide if a proposal is eligible or not.",
  },
  initiativeSettingsFormSave: {
    id: 'app.containers.Admin.initiatives.initiativeSettingsFormSave',
    defaultMessage: 'Save',
  },
  initiativeSettingsFormSaved: {
    id: 'app.containers.Admin.initiatives.initiativeSettingsFormSaved',
    defaultMessage: 'Saved!',
  },
  initiativeSettingsFormError: {
    id: 'app.containers.Admin.initiatives.initiativeSettingsFormError',
    defaultMessage: 'Something went wrong. Please try again.',
  },
  initiativeMinimumVotesError: {
    id: 'app.containers.Admin.initiatives.initiativeMinimumVotesError',
    defaultMessage: 'The minimum number of votes needs to be at least 2.',
  },
  initiativeMinimumDaysError: {
    id: 'app.containers.Admin.initiatives.initiativeMinimumDaysError',
    defaultMessage: 'The minimum number of days needs to be at least 1.',
  },
  initiativeSettingsFormSuccess: {
    id: 'app.containers.Admin.initiatives.initiativeSettingsFormSuccess',
    defaultMessage: 'Your changes have been saved.',
  },
  fieldPostingEnabled: {
    id: 'app.containers.Admin.initiatives.fieldPostingEnabled',
    defaultMessage: 'Proposal submission',
  },
  showProposalEnabled: {
    id: 'app.containers.Admin.initiatives.showProposalEnabled',
    defaultMessage: 'Proposals',
  },
  showProposalPostingEnabledInfo: {
    id: 'app.containers.Admin.initiatives.showProposalPostingEnabledInfo',
    defaultMessage:
      'Enable or disable new proposals from being posted on your platform. Existing proposals will remain visible.',
  },
  proposalSuccessMessage: {
    id: 'app.containers.Admin.initiatives.proposalSuccessMessage',
    defaultMessage: 'Success message',
  },
  proposalSuccessMessageInfo: {
    id: 'app.containers.Admin.initiatives.proposalSuccessMessageInfo',
    defaultMessage:
      'Give a clear description of what proposal initiators can expect when their proposal reaches the voting threshold in time.',
  },
  addNewProposal: {
    id: 'app.containers.Admin.initiatives.addNewProposal',
    defaultMessage: 'Add a proposal',
  },
  proposalsPageBody: {
    id: 'app.containers.Admin.initiatives.proposalsPageBody',
    defaultMessage: 'Proposals information page',
  },
  proposalsPageBodyInfo: {
    id: 'app.containers.Admin.initiatives.proposalsPageBodyInfo',
    defaultMessage: 'Change the content of the {proposalsPageLink}.',
  },
  proposalsPageLinkText: {
    id: 'app.containers.Admin.initiatives.proposalsPageLinkText',
    defaultMessage: 'proposals information page',
  },
  enableProposals: {
    id: 'app.containers.Admin.initiatives.enableProposals',
    defaultMessage: 'Enable proposals',
  },
  overviewTab: {
    id: 'app.containers.Admin.initiatives.overviewTab',
    defaultMessage: 'Overview',
  },
  feature: {
    id: 'app.containers.Admin.initiatives.feature',
    defaultMessage: 'Feature',
  },
  review: {
    id: 'app.containers.Admin.initiatives.review',
    defaultMessage: 'Review',
  },
  cosponsors: {
    id: 'app.containers.Admin.initiatives.cosponsors',
    defaultMessage: 'Cosponsors',
  },
  thresholds: {
    id: 'app.containers.Admin.initiatives.thresholds',
    defaultMessage: 'Thresholds',
  },
});
