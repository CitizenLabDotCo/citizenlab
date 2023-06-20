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
  cumulativeVotingMethodTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.cumulativeVotingMethodTitle2',
    defaultMessage: 'Multiple votes per option',
  },
  cumulativeVotingMethodSubtitle: {
    id: 'app.containers.AdminPage.ProjectEdit.Voting.cumulativeVotingMethodSubtitle',
    defaultMessage:
      'Users are given an amount of tokens to distribute between options',
  },
});
