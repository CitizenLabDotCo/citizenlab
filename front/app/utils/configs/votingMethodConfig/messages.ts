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
    id: 'app.utils.votingMethodUtils.submittedBudgetsCountText2',
    defaultMessage: 'people submitted their budgets online',
  },
  submittedBudgetCountText: {
    id: 'app.utils.votingMethodUtils.submittedBudgetCountText2',
    defaultMessage: 'person submitted their budget online',
  },
  submittedVotesCountText: {
    id: 'app.utils.votingMethodUtils.submittedVotesCountText2',
    defaultMessage: 'people submitted their votes online',
  },
  submittedVoteCountText: {
    id: 'app.utils.votingMethodUtils.submittedVoteCountText2',
    defaultMessage: 'person submitted their vote online',
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
  votingSubmittedInstructionsNoEndDate: {
    id: 'app.utils.votingMethodUtils.votingSubmittedInstructionsNoEndDate',
    defaultMessage:
      '<b>Congratulations, your vote has been submitted!</b> You can check your votes below at any point or modify them.',
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
  midSentenceVote: {
    id: 'app.utils.votingMethodUtils.midSentenceVote',
    defaultMessage: 'vote',
  },
  midSentenceVotes: {
    id: 'app.utils.votingMethodUtils.midSentenceVotes',
    defaultMessage: 'votes',
  },
  numberOfVotes: {
    id: 'app.utils.votingMethodUtils.numberOfVotes',
    defaultMessage:
      '{numberOfVotes} {numberOfVotes, plural, =0 {{votesTerm}} one {{voteTerm}} other {{votesTerm}}}',
  },
  budgetingSubmissionInstructionsTotalBudget: {
    id: 'app.utils.votingMethodUtils.budgetingSubmissionInstructionsTotalBudget',
    defaultMessage:
      'You have a total of <b>{maxBudget} {currency} to distribute between {optionCount} options</b>.',
  },
  budgetingSubmissionInstructionsPreferredOptions: {
    id: 'app.utils.votingMethodUtils.budgetingSubmissionInstructionsPreferredOptions',
    defaultMessage: 'Select your preferred options by tapping on "Add".',
  },
  budgetingSubmissionInstructionsMinBudget: {
    id: 'app.utils.votingMethodUtils.budgetingSubmissionInstructionsMinBudget',
    defaultMessage: 'The minimum required budget is {amount} {currency}.',
  },
  budgetingSubmissionInstructionsOnceYouAreDone: {
    id: 'app.utils.votingMethodUtils.budgetingSubmissionInstructionsOnceYouAreDone',
    defaultMessage: 'Once you are done, click "Submit" to submit your budget.',
  },
  budgetingSubmittedInstructions: {
    id: 'app.utils.votingMethodUtils.budgetingSubmittedInstructions2',
    defaultMessage:
      '<b>Congratulations, your budget has been submitted!</b> You can check your options below at any point or modify them before <b>{endDate}</b>.',
  },
  budgetingSubmittedInstructionsNoEndDate: {
    id: 'app.utils.votingMethodUtils.budgetingSubmittedInstructionsNoEndDate',
    defaultMessage:
      '<b>Congratulations, your budget has been submitted!</b> You can check your options below at any point.',
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
  cumulativeVotingInstructionsTotalVotes: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsTotalVotes',
    defaultMessage:
      'You have a total of <b>{totalVotes} {voteTerm} to distribute between {optionCount} options</b>.',
  },
  cumulativeVotingInstructionsPreferredOptions: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsPreferredOptions2',
    defaultMessage: 'Select your preferred options by tapping on "Select".',
  },
  cumulativeVotingInstructionsMaxVotesPerIdea: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsMaxVotesPerIdea2',
    defaultMessage:
      'You can add a maximum number of {maxVotes} {voteTerm} per option.',
  },
  cumulativeVotingInstructionsOnceYouAreDone: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsOnceYouAreDone',
    defaultMessage: 'Once you are done, click “Submit” to cast your vote.',
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
  singleVotingOneVoteEnded: {
    id: 'app.utils.votingMethodUtils.singleVotingOneVoteEnded',
    defaultMessage:
      'Voting closed on <b>{endDate}.</b> Participants could <b>vote for 1 option.</b>',
  },
  singleVotingOneVoteYouCanVote: {
    id: 'app.utils.votingMethodUtils.singleVotingOneVoteYouCanVote2',
    defaultMessage:
      'You have <b>1 vote</b> that you can assign to one of the options.',
  },
  singleVotingMultipleVotesYouCanVote: {
    id: 'app.utils.votingMethodUtils.singleVotingMultipleVotesYouCanVote2',
    defaultMessage:
      'You have <b>{totalVotes} votes</b> that you can assign to the options.',
  },
  singleVotingUnlimitedVotesYouCanVote: {
    id: 'app.utils.votingMethodUtils.singleVotingUnlimitedVotesYouCanVote',
    defaultMessage: 'You can vote for as many options as you would like.',
  },

  singleVotingPreferredOption: {
    id: 'app.utils.votingMethodUtils.singleVotingOneVotePreferredOption',
    defaultMessage: 'Select your preferred option by tapping on “Vote”.',
  },
  singleVotingPreferredOptions: {
    id: 'app.utils.votingMethodUtils.singleVotingMultipleVotesPreferredOptions',
    defaultMessage: 'Select your preferred options by tapping on “Vote”',
  },

  singleVotingOnceYouAreDone: {
    id: 'app.utils.votingMethodUtils.singleVotingOnceYouAreDone',
    defaultMessage: 'Once you are done, click “Submit” to cast your vote.',
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
