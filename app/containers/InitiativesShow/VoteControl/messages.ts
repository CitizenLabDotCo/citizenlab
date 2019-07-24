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
  xVotes: {
    id: 'app.containers.InitiativesShow.VoteControl.xVotes',
    defaultMessage: '{count, plural, =0 {no votes} one {1 vote} other {# votes}}',
  },
  vote: {
    id: 'app.containers.InitiativesShow.VoteControl.vote',
    defaultMessage: 'Vote',
  },
  readAnswer: {
    id: 'app.containers.InitiativesShow.VoteControl.readAnswer',
    defaultMessage: 'Read answer',
  },
});
