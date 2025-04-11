import { defineMessages } from 'react-intl';

export default defineMessages({
  xComments: {
    id: 'app.containers.survey.sentiment.numberComments',
    defaultMessage:
      '{count, plural, =0 {0 comments} one {1 comment} other {# comments}}',
  },
  noAnswers: {
    id: 'app.containers.survey.sentiment.noAnswers2',
    defaultMessage: 'No responses at this time.',
  },
});
