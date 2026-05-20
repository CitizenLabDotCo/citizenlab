import { defineMessages } from 'react-intl';

export default defineMessages({
  readMore: {
    id: 'app.containers.IdeaCard.readMore',
    defaultMessage: 'Read more',
  },
  xVotesOfY: {
    id: 'app.containers.IdeaCard.xVotesOfY',
    defaultMessage:
      '{xVotes, plural, =0 {no votes} one {1 vote} other {# votes}} out of {votingThreshold}',
  },
  comments: {
    id: 'app.containers.IdeaCard.comments',
    defaultMessage:
      '{commentsCount, plural, =0 {no comments} one  { comment} other { comments}}',
  },
});
