import { defineMessages } from 'react-intl';

export default defineMessages({
  xComments: {
    id: 'app.components.InitiativeCard.xComments',
    defaultMessage:
      '{commentsCount, plural, =0 {no comments} one {1 comment} other {# comments}}',
  },
  xVotesOfY: {
    id: 'app.components.InitiativeCard.xVotesOfY',
    defaultMessage:
      '{xVotes, plural, =0 {no votes} one {1 vote} other {# votes}} out of {votingThreshold}',
  },
});
