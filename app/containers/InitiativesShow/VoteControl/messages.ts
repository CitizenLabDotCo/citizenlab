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
  xVotes: {
    id: 'app.containers.InitiativesShow.VoteControl.xVotes',
    defaultMessage: '{count, plural, =0 {no votes} one {1 vote} other {# votes}}',
  },
  vote: {
    id: 'app.containers.InitiativesShow.VoteControl.vote',
    defaultMessage: 'Vote',
  },
});
