import { defineMessages } from 'react-intl';

export default defineMessages({
  howToParticipate: {
    id: 'app.utils.votingMethodUtils.howToParticipate',
    defaultMessage: 'How to participate',
  },
  budgetSubmitted: {
    id: 'app.utils.votingMethodUtils.budgetSubmitted',
    defaultMessage: 'Budget submitted',
  },
  finalResults: {
    id: 'app.utils.votingMethodUtils.finalResults',
    defaultMessage: 'Final results',
  },
  submittedBudgetsCountText: {
    id: 'app.utils.votingMethodUtils.submittedBudgetsCountText',
    defaultMessage: 'people submitted their budgets',
  },
  budgets: {
    id: 'app.utils.votingMethodUtils.budgets',
    defaultMessage: 'Budgets',
  },
  votes: {
    id: 'app.utils.votingMethodUtils.votes',
    defaultMessage: 'Votes',
  },
  budgetingSubmissionInstructions: {
    id: 'app.utils.votingMethodUtils.budgetingSubmissionInstructions',
    defaultMessage:
      'You have a total of <b>{maxBudget} USD to distribute between {optionCount} options</b>. Select your preferred options by tapping on "Add". Once you are done, click "Submit" to submit your budget.',
  },
  budgetingSubmittedInstructions: {
    id: 'app.utils.votingMethodUtils.budgetingSubmittedInstructions',
    defaultMessage:
      'Your budget has been submitted. You can check your options below at any point or modify them before the deadline.',
  },
});
