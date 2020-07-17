import { defineMessages } from 'react-intl';

export default defineMessages({
  xComments: {
    id: 'app.containers.IdeaCard.xComments',
    defaultMessage:
      '{commentsCount, plural, =0 {no comments} one {1 comment} other {# comments}}',
  },
  a11y_ideaTitle: {
    id: 'app.containers.IdeaCard.a11y_ideaTitle',
    defaultMessage: 'Idea: ',
  },
});
