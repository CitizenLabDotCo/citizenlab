import { defineMessages } from 'react-intl';

export default defineMessages({
  xComments: {
    id: 'app.containers.survey.sentiment.numberComments',
    defaultMessage:
      '{count, plural, =0 {0 comments} one {1 comment} other {# comments}}',
  },
  outOf: {
    id: 'app.containers.survey.sentiment.outOf',
    defaultMessage: '{/{maxValue}',
  },
});
