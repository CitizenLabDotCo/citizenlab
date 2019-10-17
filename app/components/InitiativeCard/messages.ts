import { defineMessages } from 'react-intl';

export default defineMessages({
  xComments: {
    id: 'app.components.InitiativeCard.xComments',
    defaultMessage: '{commentsCount, plural, =0 {no comments} one {1 comment} other {# comments}}',
  },
  xVotesOfY: {
    id: 'app.components.InitiativeCard.xVotesOfY',
    defaultMessage: '{xVotes} out of {votingThreshold}',
  },
  xVotes: {
    id: 'app.components.InitiativeCard.xVotes',
    defaultMessage: '{count, plural, =0 {no votes} one {1 vote} other {# votes}}',
  },
});
