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
  submittedBudgetCountText: {
    id: 'app.utils.votingMethodUtils.submittedBudgetCountText',
    defaultMessage: 'person submitted their budget',
  },
  submittedVotesCountText: {
    id: 'app.utils.votingMethodUtils.submittedVotesCountText',
    defaultMessage: 'people submitted their votes',
  },
  submittedVoteCountText: {
    id: 'app.utils.votingMethodUtils.submittedVoteCountText',
    defaultMessage: 'person submitted their vote',
  },
  votingPreSubmissionWarning: {
    id: 'app.utils.votingMethodUtils.votingPreSubmissionWarning',
    defaultMessage:
      '<b>Your votes will not be counted</b> until you click "Submit"',
  },
  budgetingPreSubmissionWarning: {
    id: 'app.utils.votingMethodUtils.budgetingPreSubmissionWarning',
    defaultMessage:
      '<b>Your budget will not be counted</b> until you click "Submit"',
  },
  votingSubmittedInstructions: {
    id: 'app.utils.votingMethodUtils.votingSubmittedInstructions',
    defaultMessage:
      '<b>Congratulations, your vote has been submitted!</b> You can check your votes below at any point or modify them before <b>{endDate}</b>.',
  },
  votingSubmittedInstructionsContinuous: {
    id: 'app.utils.votingMethodUtils.votingSubmittedInstructionsContinuous',
    defaultMessage:
      '<b>Congratulations, your vote has been submitted!</b> You can check your votes below at any point or modify them.',
  },
  budgets: {
    id: 'app.utils.votingMethodUtils.budgets',
    defaultMessage: 'Budgets',
  },
  budget: {
    id: 'app.utils.votingMethodUtils.budget',
    defaultMessage: 'budget',
  },
  vote: {
    id: 'app.utils.votingMethodUtils.vote',
    defaultMessage: 'Vote',
  },
  votes: {
    id: 'app.utils.votingMethodUtils.votes',
    defaultMessage: 'Votes',
  },
  budgetingSubmissionInstructions: {
    id: 'app.utils.votingMethodUtils.budgetingSubmissionInstructions2',
    defaultMessage:
      'You have a total of <b>{maxBudget} {currency} to distribute between {optionCount} options</b>. Select your preferred options by tapping on "Add". Once you are done, click "Submit" to submit your budget.',
  },
  budgetingSubmittedInstructions: {
    id: 'app.utils.votingMethodUtils.budgetingSubmittedInstructions2',
    defaultMessage:
      '<b>Congratulations, your budget has been submitted!</b> You can check your options below at any point or modify them before <b>{endDate}</b>.',
  },
  budgetingSubmittedInstructionsContinuous: {
    id: 'app.utils.votingMethodUtils.budgetingSubmittedInstructionsContinuous',
    defaultMessage:
      '<b>Congratulations, your budget has been submitted!</b> You can check your options below at any point or modify them.',
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
  castYourVote: {
    id: 'app.utils.votingMethodUtils.castYourVote',
    defaultMessage: 'Cast your vote',
  },
  votesCast: {
    id: 'app.utils.votingMethodUtils.votesCast',
    defaultMessage: 'Votes cast',
  },
  howToVote: {
    id: 'app.utils.votingMethodUtils.howToVote',
    defaultMessage: 'How to vote',
  },
  votingClosed: {
    id: 'app.utils.votingMethodUtils.votingClosed',
    defaultMessage: 'Voting closed',
  },
  results: {
    id: 'app.utils.votingMethodUtils.results',
    defaultMessage: 'Results',
  },
  finalTally: {
    id: 'app.utils.votingMethodUtils.finalTally',
    defaultMessage: 'Final tally',
  },
  cumulativeVotingInstructions: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructions2',
    defaultMessage:
      'You have a total of <b>{totalVotes} {voteTerm} to distribute between {optionCount} options</b>. Select your preferred options by tapping on “Vote”. Once you are done, click “Submit” to cast your vote.',
  },
  multipleVotingEnded: {
    id: 'app.utils.votingMethodUtils.multipleVotingEnded',
    defaultMessage:
      'Voting closed on <b>{endDate}.</b> Participants had <b>{maxVotes} {voteTerm} each to distribute between {optionCount} options.</b>',
  },
  singleVotingUnlimitedEnded: {
    id: 'app.utils.votingMethodUtils.singleVotingUnlimitedEnded',
    defaultMessage:
      'Voting closed on <b>{endDate}.</b> Participants could <b>vote for as many options as they wished.</b>',
  },
  singleVotingEnded: {
    id: 'app.utils.votingMethodUtils.singleVotingEnded',
    defaultMessage:
      'Voting closed on <b>{endDate}.</b> Participants could <b>vote for {maxVotes} options.</b>',
  },
  singleVotingMultipleVotesInstructions: {
    id: 'app.utils.votingMethodUtils.singleVotingMultipleVotesInstructions',
    defaultMessage:
      'You can vote for <b> {totalVotes} options</b>. Select your preferred options by tapping on “Vote”. Once you are done, click “Submit” to cast your vote.',
  },
  singleVotingOneVoteInstructions: {
    id: 'app.utils.votingMethodUtils.singleVotingOneVoteInstructions2',
    defaultMessage:
      'You can vote for <b> 1 option </b>. Select your preferred option by tapping on “Vote”. Once you are done, click “Submit” to cast your vote.',
  },
  singleVotingInstructionsUnlimited: {
    id: 'app.utils.votingMethodUtils.singleVotingInstructionsUnlimited',
    defaultMessage:
      'You can vote for as many options as you would like. Select your preferred options by tapping on “Vote”. Once you are done, click “Submit” to cast your vote.',
  },
  budgetSubmittedWithIcon: {
    id: 'app.utils.votingMethodUtils.budgetSubmittedWithIcon',
    defaultMessage: 'Budget submitted 🎉',
  },
  voteSubmittedWithIcon: {
    id: 'app.utils.votingMethodUtils.voteSubmittedWithIcon',
    defaultMessage: 'Vote submitted 🎉',
  },
});
