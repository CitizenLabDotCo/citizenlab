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
    id: 'app.utils.votingMethodUtils.votingPreSubmissionWarning1',
    defaultMessage:
      '<b>Your vote will not be counted</b> until you click "Submit"',
  },
  budgetingPreSubmissionWarning: {
    id: 'app.utils.votingMethodUtils.budgetingPreSubmissionWarning',
    defaultMessage:
      '<b>Your budget will not be counted</b> until you click "Submit"',
  },
  votingSubmittedInstructions: {
    id: 'app.utils.votingMethodUtils.votingSubmittedInstructions1',
    defaultMessage:
      '<b>Congratulations, your vote has been submitted!</b> You can check or modify your submission before <b>{endDate}</b>.',
  },
  votingSubmittedInstructionsNoEndDate: {
    id: 'app.utils.votingMethodUtils.votingSubmittedInstructionsNoEndDate1',
    defaultMessage:
      '<b>Congratulations, your vote has been submitted!</b> You can check or modify your submission below at any point.',
  },
  numberOfVotes: {
    id: 'app.utils.votingMethodUtils.numberOfVotes1',
    defaultMessage:
      '{numberOfVotes, plural, =0 {0 votes} one {1 vote} other {# votes}}',
  },
  numberOfPoints: {
    id: 'app.utils.votingMethodUtils.numberOfPoints',
    defaultMessage:
      '{numberOfVotes, plural, =0 {0 points} one {1 point} other {# points}}',
  },
  numberOfTokens: {
    id: 'app.utils.votingMethodUtils.numberOfTokens',
    defaultMessage:
      '{numberOfVotes, plural, =0 {0 tokens} one {1 token} other {# tokens}}',
  },
  numberOfCredits: {
    id: 'app.utils.votingMethodUtils.numberOfCredits',
    defaultMessage:
      '{numberOfVotes, plural, =0 {0 credits} one {1 credit} other {# credits}}',
  },
  numberOfPercents: {
    id: 'app.utils.votingMethodUtils.numberOfPercents2',
    defaultMessage: '{numberOfVotes, plural, =0 {0%} one {1%} other {#%}}',
  },
  budgetingSubmissionInstructionsTotalBudget2: {
    id: 'app.utils.votingMethodUtils.budgetingSubmissionInstructionsTotalBudget2',
    defaultMessage:
      'You have a total of <b>{maxBudget} to distribute between {optionCount} options</b>.',
  },
  budgetingSubmissionInstructionsPreferredOptions: {
    id: 'app.utils.votingMethodUtils.budgetingSubmissionInstructionsPreferredOptions',
    defaultMessage: 'Select your preferred options by tapping on "Add".',
  },
  budgetingSubmissionInstructionsMinBudget1: {
    id: 'app.utils.votingMethodUtils.budgetingSubmissionInstructionsMinBudget1',
    defaultMessage: 'The minimum required budget is {amount}.',
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
  budgetParticipationEnded1: {
    id: 'app.utils.votingMethodUtils.budgetParticipationEnded1',
    defaultMessage:
      '<b>Submitting budgets closed on {endDate}.</b> Participants had a total of <b>{maxBudget} each to distribute between {optionCount} options.</b>',
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
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsTotalVotes3',
    defaultMessage:
      'You have a total of <b>{totalVotes, plural, one {# vote} other {# votes}} to distribute between {optionCount, plural, one {# option} other {# options}}</b>.',
  },
  cumulativeVotingInstructionsTotalPoints: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsTotalPoints2',
    defaultMessage:
      'You have a total of <b>{totalVotes, plural, one {# point} other {# points}} to distribute between {optionCount, plural, one {# option} other {# options}}</b>.',
  },
  cumulativeVotingInstructionsTotalTokens: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsTotalTokens2',
    defaultMessage:
      'You have a total of <b>{totalVotes, plural, one {# token} other {# tokens}} to distribute between {optionCount, plural, one {# option} other {# options}}</b>.',
  },
  cumulativeVotingInstructionsTotalCredits: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsTotalCredits2',
    defaultMessage:
      'You have a total of <b>{totalVotes, plural, one {# credit} other {# credits}} to distribute between {optionCount, plural, one {# option} other {# options}}</b>.',
  },
  cumulativeVotingInstructionsPreferredOptions: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsPreferredOptions2',
    defaultMessage: 'Select your preferred options by tapping on "Select".',
  },
  cumulativeVotingInstructionsMaxVotesPerIdea: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsMaxVotesPerIdea4',
    defaultMessage:
      'You can add a maximum of {maxVotes, plural, one {# vote} other {# votes}} per option.',
  },
  cumulativeVotingInstructionsMaxPointsPerIdea: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsMaxPointsPerIdea1',
    defaultMessage:
      'You can add a maximum of {maxVotes, plural, one {# point} other {# points}} per option.',
  },
  cumulativeVotingInstructionsMaxTokensPerIdea: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsMaxTokensPerIdea1',
    defaultMessage:
      'You can add a maximum of {maxVotes, plural, one {# token} other {# tokens}} per option.',
  },
  cumulativeVotingInstructionsMaxCreditsPerIdea: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsMaxCreditsPerIdea1',
    defaultMessage:
      'You can add a maximum of {maxVotes, plural, one {# credit} other {# credits}} per option.',
  },
  cumulativeVotingInstructionsMaxPercentsPerIdea: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsMaxPercentsPerIdea2',
    defaultMessage:
      'You can add a maximum of {maxVotes, plural, one {#%} other {#%}} per option.',
  },
  cumulativeVotingInstructionsOnceYouAreDone: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsOnceYouAreDone',
    defaultMessage: 'Once you are done, click “Submit” to cast your vote.',
  },
  cumulativeVotingInstructionsTotalPercents: {
    id: 'app.utils.votingMethodUtils.cumulativeVotingInstructionsTotalPercents2',
    defaultMessage:
      'You have <b>{totalVotes, plural, one {#%} other {#%}} to distribute between {optionCount, plural, one {# option} other {# options}}</b>.',
  },
  minSelectedOptionsMessage: {
    id: 'app.utils.votingMethodUtils.minSelectedOptionsMessage',
    defaultMessage:
      ' You must select a minimum of at least <b>{minSelectedOptions, plural, one {# option} other {# options}}</b>.',
  },
  multipleVotingEnded: {
    id: 'app.utils.votingMethodUtils.multipleVotingEnded1',
    defaultMessage: 'Voting closed on <b>{endDate}.</b>',
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
