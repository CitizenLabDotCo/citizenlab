import { defineMessages } from 'react-intl';

export default defineMessages({
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

  voted: {
    id: 'app.containers.IdeasShow.proposals.VoteControl.voted',
    defaultMessage: 'Voted',
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
