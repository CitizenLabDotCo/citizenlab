import { defineMessages } from 'react-intl';

export default defineMessages({
  // Defaults
  votingNotSignedIn: {
    id: 'app.utils.participationMethodConfig.voting.votingNotSignedIn',
    defaultMessage: 'You must login or register to vote.',
  },
  votingNotPermitted: {
    id: 'app.utils.participationMethodConfig.voting.votingNotPermitted',
    defaultMessage: 'You are not permitted to vote.',
  },
  votingNotInGroup: {
    id: 'app.utils.participationMethodConfig.voting.votingNotInGroup',
    defaultMessage: 'You do not meet the requirements to vote.',
  },
  votingNotVerified: {
    id: 'app.utils.participationMethodConfig.voting.votingNotVerified',
    defaultMessage: 'You must verify your account before you can vote.',
  },
  budgetingNotSignedIn: {
    id: 'app.utils.votingMethodUtils.budgetingNotSignedIn',
    defaultMessage: 'You must login or register to assign budgets.',
  },
  budgetingNotPermitted: {
    id: 'app.utils.votingMethodUtils.budgetingNotPermitted',
    defaultMessage: 'You are not permitted to assign budgets.',
  },
  budgetingNotInGroup: {
    id: 'app.utils.votingMethodUtils.budgetingNotInGroup',
    defaultMessage: 'You do not meet the requirements to assign budgets.',
  },
  budgetingNotVerified: {
    id: 'app.utils.votingMethodUtils.budgetingNotVerified',
    defaultMessage:
      'You must verify your account before you can assign budgets.',
  },
});
