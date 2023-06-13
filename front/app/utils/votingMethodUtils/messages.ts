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
  budget: {
    id: 'app.utils.votingMethodUtils.budget',
    defaultMessage: 'budget',
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
    id: 'app.utils.votingMethodUtils.budgetingSubmittedInstructions2',
    defaultMessage:
      '<b>Congratulations, your budget has been submitted!</b> You can check your options below at any point or modify them before <b>{endDate}</b>.',
  },
  budgetParticipationEnded: {
    id: 'app.utils.votingMethodUtils.budgetParticipationEnded',
    defaultMessage:
      '<b>Submitting budgets closed on {endDate}.</b> Participants had a total of <b>{maxBudget} {currency} each to distribute between {optionCount} options.</b>',
  },
  submitYourBudget: {
    id: 'app.utils.votingMethodUtils.submitYourBudget',
    defaultMessage: 'Submit your budget',
  },
  results: {
    id: 'app.utils.votingMethodUtils.results',
    defaultMessage: 'Results',
  },
});
