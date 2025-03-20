import { defineMessages } from 'react-intl';

export default defineMessages({
  xComments: {
    id: 'app.containers.survey.sentiment.numberComments',
    defaultMessage:
      '{count, plural, =0 {0 comments} one {1 comment} other {# comments}}',
  },
  noFollowUpResponses: {
    id: 'app.containers.survey.sentiment.noFollowUpResponses',
    defaultMessage: 'No follow-up responses for this question.',
  },
});
