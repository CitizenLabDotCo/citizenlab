import { defineMessages } from 'react-intl';

export default defineMessages({
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
    defaultMessage: '{votingThreshold} votes needed to get this initiative {proposedStatusExplanationBold}',
  },
  proposedStatusExplanationBold: {
    id: 'app.containers.InitiativesShow.VoteControl.proposedStatusExplanationBold',
    defaultMessage: 'considered by {orgName}',
  },
  ineligibleStatusExplanation: {
    id: 'app.containers.InitiativesShow.VoteControl.ineligibleStatusExplanation',
    defaultMessage: 'This initiative doesn\'t meet the criteria {ineligibleStatusExplanationBold}',
  },
  ineligibleStatusExplanationBold: {
    id: 'app.containers.InitiativesShow.VoteControl.ineligibleStatusExplanationBold',
    defaultMessage: 'to be eligible',
  },
  expiredStatusExplanation: {
    id: 'app.containers.InitiativesShow.VoteControl.expiredStatusExplanation',
    defaultMessage: 'This initiative expired as it {expiredStatusExplanationBold}.',
  },
  expiredStatusExplanationBold: {
    id: 'app.containers.InitiativesShow.VoteControl.expiredStatusExplanationBold',
    defaultMessage: 'didn\'t reach {votingThreshold} votes in time',
  },
  xVotes: {
    id: 'app.containers.InitiativesShow.VoteControl.xVotes',
    defaultMessage: '{count, plural, =0 {no votes} one {1 vote} other {# votes}}',
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
    defaultMessage: 'You\'ll get notified when this initiative goes to the next step. There\'s {xDays} left.',
  },
  xDays: {
    id: 'app.containers.InitiativesShow.VoteControl.xDays',
    defaultMessage: '{x, plural, =0 {less than a day} one {one day} other {# days}}',
  },
  unvoteLink: {
    id: 'app.containers.InitiativesShow.VoteControl.unvoteLink',
    defaultMessage: 'Cancel my vote',
  },
});
