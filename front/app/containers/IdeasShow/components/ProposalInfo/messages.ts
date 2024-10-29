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
