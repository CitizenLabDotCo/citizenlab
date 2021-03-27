import { defineMessages } from 'react-intl';

export default defineMessages({
  invisibleTitle: {
    id: 'app.containers.InitiativesShow.VoteControl.invisibleTitle',
    defaultMessage: 'Status and votes',
  },
  moreInfo: {
    id: 'app.containers.InitiativesShow.VoteControl.moreInfo',
    defaultMessage: 'More info',
  },
  days: {
    id: 'app.containers.InitiativesShow.VoteControl.days',
    defaultMessage: 'days',
  },
  hours: {
    id: 'app.containers.InitiativesShow.VoteControl.hours',
    defaultMessage: 'hours',
  },
  minutes: {
    id: 'app.containers.InitiativesShow.VoteControl.minutes',
    defaultMessage: 'mins',
  },
  proposedStatusExplanation: {
    id: 'app.containers.InitiativesShow.VoteControl.proposedStatusExplanation',
    defaultMessage:
      '{votingThreshold} votes needed to get this initiative {proposedStatusExplanationBold}',
  },
  proposedStatusExplanationBold: {
    id:
      'app.containers.InitiativesShow.VoteControl.proposedStatusExplanationBold',
    defaultMessage: 'considered by {orgName}',
  },
  proposedStatusExplanationMobile: {
    id:
      'app.containers.InitiativesShow.VoteControl.proposedStatusExplanationMobile',
    defaultMessage:
      '{votingThreshold} votes needed within {daysLeft, plural, =0 {less than a day} one {one day} other {# days}} to get this initiative {proposedStatusExplanationMobileBold}',
  },
  proposedStatusExplanationMobileBold: {
    id:
      'app.containers.InitiativesShow.VoteControl.proposedStatusExplanationMobileBold',
    defaultMessage: 'considered by {orgName}',
  },
  ineligibleStatusExplanation: {
    id:
      'app.containers.InitiativesShow.VoteControl.ineligibleStatusExplanation',
    defaultMessage:
      "This initiative doesn't meet the criteria {ineligibleStatusExplanationBold}",
  },
  ineligibleStatusExplanationBold: {
    id:
      'app.containers.InitiativesShow.VoteControl.ineligibleStatusExplanationBold',
    defaultMessage: 'to be eligible',
  },
  expiredStatusExplanation: {
    id: 'app.containers.InitiativesShow.VoteControl.expiredStatusExplanation',
    defaultMessage:
      'This initiative expired as it {expiredStatusExplanationBold}.',
  },
  expiredStatusExplanationBold: {
    id:
      'app.containers.InitiativesShow.VoteControl.expiredStatusExplanationBold',
    defaultMessage: "didn't reach {votingThreshold} votes in time",
  },
  thresholdReachedStatusExplanation: {
    id:
      'app.containers.InitiativesShow.VoteControl.thresholdReachedStatusExplanation',
    defaultMessage:
      '{thresholdReachedStatusExplanationBold}. {orgName} got notified and will provide an answer. Voting remains open.',
  },
  thresholdReachedStatusExplanationBold: {
    id:
      'app.containers.InitiativesShow.VoteControl.thresholdReachedStatusExplanationBold',
    defaultMessage: 'The threshold has been reached',
  },
  answeredStatusExplanation: {
    id: 'app.containers.InitiativesShow.VoteControl.answeredStatusExplanation',
    defaultMessage: '{answeredStatusExplanationBold} Voting remains open.',
  },
  answeredStatusExplanationBold: {
    id:
      'app.containers.InitiativesShow.VoteControl.answeredStatusExplanationBold',
    defaultMessage:
      '{orgName} received the initiative and gave an official answer.',
  },
  xVotes: {
    id: 'app.containers.InitiativesShow.VoteControl.xVotes',
    defaultMessage:
      '{count, plural, =0 {no votes} one {1 vote} other {# votes}}',
  },
  vote: {
    id: 'app.containers.InitiativesShow.VoteControl.vote',
    defaultMessage: 'Vote',
  },
  cancelVote: {
    id: 'app.containers.InitiativesShow.VoteControl.cancelVote',
    defaultMessage: 'Cancel vote',
  },
  readAnswer: {
    id: 'app.containers.InitiativesShow.VoteControl.readAnswer',
    defaultMessage: 'Read answer',
  },
  votedTitle: {
    id: 'app.containers.InitiativesShow.VoteControl.votedTitle',
    defaultMessage: 'Your vote has been submitted!',
  },
  votedText: {
    id: 'app.containers.InitiativesShow.VoteControl.votedText',
    defaultMessage:
      "You'll get notified when this initiative goes to the next step. {x, plural, =0 {There's {xDays} left.} one {There's {xDays} left.} other {There are {xDays} left.}}",
  },
  xDays: {
    id: 'app.containers.InitiativesShow.VoteControl.xDays',
    defaultMessage:
      '{x, plural, =0 {less than a day} one {one day} other {# days}}',
  },
  unvoteLink: {
    id: 'app.containers.InitiativesShow.VoteControl.unvoteLink',
    defaultMessage: 'Cancel my vote',
  },
  xVotesOfY: {
    id: 'app.containers.InitiativesShow.VoteControl.xVotesOfY',
    defaultMessage: '{xVotes} out of {votingThreshold}',
  },
  xPeopleVoted: {
    id: 'app.containers.InitiativesShow.VoteControl.xPeopleVoted',
    defaultMessage: '{xPeople} voted for this initiative',
  },
  xPeople: {
    id: 'app.containers.InitiativesShow.VoteControl.xPeople',
    defaultMessage:
      '{count, plural, =0 {No one} one {One person} other {# people}}',
  },
  or: {
    id: 'app.containers.InitiativesShow.VoteControl.or',
    defaultMessage: 'or',
  },
  votingNotPermitted: {
    id: 'app.containers.InitiativesShow.VoteControl.votingNotPermitted',
    defaultMessage: "You don't have the rights to vote on this proposal.",
  },
});
