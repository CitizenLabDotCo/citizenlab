import { defineMessages } from 'react-intl';

export default defineMessages({
  invisibleTitle: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.invisibleTitle',
    defaultMessage: 'Status and votes',
  },
  moreInfo: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.moreInfo',
    defaultMessage: 'More info',
  },
  days: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.days',
    defaultMessage: 'days',
  },
  hours: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.hours',
    defaultMessage: 'hours',
  },
  minutes: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.minutes',
    defaultMessage: 'mins',
  },
  proposedStatusExplanation: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.proposedStatusExplanation',
    defaultMessage:
      '{votingThreshold} votes needed to get this initiative {proposedStatusExplanationBold}',
  },
  proposedStatusExplanationBold: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.proposedStatusExplanationBold',
    defaultMessage: 'considered by {orgName}',
  },
  proposedStatusExplanationMobile: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.proposedStatusExplanationMobile',
    defaultMessage:
      '{votingThreshold} votes needed within {daysLeft, plural, =0 {less than a day} one {one day} other {# days}} to get this initiative {proposedStatusExplanationMobileBold}',
  },
  proposedStatusExplanationMobileBold: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.proposedStatusExplanationMobileBold',
    defaultMessage: 'considered by {orgName}',
  },
  ineligibleStatusExplanation: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.ineligibleStatusExplanation',
    defaultMessage:
      "This initiative doesn't meet the criteria {ineligibleStatusExplanationBold}",
  },
  ineligibleStatusExplanationBold: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.ineligibleStatusExplanationBold',
    defaultMessage: 'to be eligible',
  },
  expiredStatusExplanation: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.expiredStatusExplanation',
    defaultMessage:
      'This initiative expired as it {expiredStatusExplanationBold}.',
  },
  expiredStatusExplanationBold: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.expiredStatusExplanationBold',
    defaultMessage: "didn't reach {votingThreshold} votes in time",
  },
  thresholdReachedStatusExplanation: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.thresholdReachedStatusExplanation',
    defaultMessage:
      '{thresholdReachedStatusExplanationBold}. {orgName} got notified and will provide an answer. Voting remains open.',
  },
  thresholdReachedStatusExplanationBold: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.thresholdReachedStatusExplanationBold',
    defaultMessage: 'The threshold has been reached',
  },
  answeredStatusExplanation: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.answeredStatusExplanation',
    defaultMessage: '{answeredStatusExplanationBold} Voting remains open.',
  },
  answeredStatusExplanationBold: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.answeredStatusExplanationBold',
    defaultMessage:
      '{orgName} received the initiative and gave an official answer.',
  },
  xVotes: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.xVotes',
    defaultMessage:
      '{count, plural, =0 {no votes} one {1 vote} other {# votes}}',
  },
  vote: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.vote',
    defaultMessage: 'Vote',
  },
  cancelVote: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.cancelVote',
    defaultMessage: 'Cancel vote',
  },
  voted: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.voted',
    defaultMessage: 'Voted',
  },
  readAnswer: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.readAnswer',
    defaultMessage: 'Read answer',
  },
  votedTitle: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.votedTitle',
    defaultMessage: 'Your vote has been submitted!',
  },
  votedText: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.votedText',
    defaultMessage:
      "You'll get notified when this initiative goes to the next step. {x, plural, =0 {There's {xDays} left.} one {There's {xDays} left.} other {There are {xDays} left.}}",
  },
  xDays: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.xDays',
    defaultMessage:
      '{x, plural, =0 {less than a day} one {one day} other {# days}}',
  },
  a11y_xVotesOfRequiredY: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.a11y_xVotesOfRequiredY',
    defaultMessage: '{xVotes} out of {votingThreshold} required votes',
  },
  votingNotPermitted: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.votingNotPermitted1',
    defaultMessage:
      'Unfortunately, you cannot vote on this proposal. Read why in {link}.',
  },
  guidelinesLinkText: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.guidelinesLinkText',
    defaultMessage: 'our guidelines',
  },
  a11y_timeLeft: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.a11y_timeLeft',
    defaultMessage: 'Time left to vote:',
  },
});
