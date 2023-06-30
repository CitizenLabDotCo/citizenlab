import { defineMessages } from 'react-intl';

export default defineMessages({
  votingMethodSelectorTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.votingMethodSelectorTitle',
    defaultMessage: 'Voting method',
  },
  votingMethodSelectorSubtitle: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.votingMethodSelectorSubtitle',
    defaultMessage: 'Each voting method has different pre-configurations',
  },
  votingMethodSelectorTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.votingMethodSelectorTooltip2',
    defaultMessage: 'The voting method determines the rules of how users vote',
  },
  budgetingVotingMethodTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.budgetingVotingMethodTitle2',
    defaultMessage: 'Budget allocation',
  },
  budgetingVotingMethodSubtitle: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.budgetingVotingMethodSubtitle',
    defaultMessage:
      'Assign a budget to options and ask participants to select their preferred options that fit within a total budget.',
  },
  multipleVotingMethodTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.multipleVotingMethodTitle',
    defaultMessage: 'Multiple votes per option',
  },
  multipleVotingMethodSubtitle: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.multipleVotingMethodSubtitle',
    defaultMessage:
      'Users are given an amount of tokens to distribute between options',
  },
  singleVotingMethodTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.singleVotingMethodTitle',
    defaultMessage: 'One vote per option',
  },
  singleVotingMethodSubtitle: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.singleVotingMethodSubtitle',
    defaultMessage: 'Users can chose to approve any of the options',
  },
  maximumVotesRecommendation: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.maximumVotesRecommendation',
    defaultMessage:
      'Its recommended that you limit the maximum votes per option to 50% of the total budget to avoid {strategicVotingLink}.',
  },
  voteCalled: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.voteCalled',
    defaultMessage: 'What should a vote be called?',
  },
  strategicVotingLinkText: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.strategicVotingLinkText',
    defaultMessage: 'strategic voting',
  },
  numberVotesPerUser: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.numberVotesPerUser',
    defaultMessage: 'Number of votes per user',
  },
  maxVotesPerOption: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.maxVotesPerOption',
    defaultMessage: 'Maximum votes per option',
  },
  voteCalledPlaceholderSingular: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.voteCalledPlaceholderSingular',
    defaultMessage: 'E.g. Token',
  },
  voteCalledPlaceholderPlural: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.voteCalledPlaceholderPlural',
    defaultMessage: 'E.g. Tokens',
  },
});
