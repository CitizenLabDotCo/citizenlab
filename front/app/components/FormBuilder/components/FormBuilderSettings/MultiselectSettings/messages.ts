import { defineMessages } from 'react-intl';

export default defineMessages({
  limitNumberAnswers: {
    id: 'app.components.formBuilder.limitNumberAnswers',
    defaultMessage: 'Limit number of answers',
  },
  limitNumberAnswersTooltip: {
    id: 'app.components.formBuilder.limitAnswersTooltip',
    defaultMessage:
      'When turned on, respondents need to select the specified number of answers to proceed.',
  },
  minimum: {
    id: 'app.components.formBuilder.multiselect.minimum',
    defaultMessage: 'Minimum',
  },
  maximum: {
    id: 'app.components.formBuilder.multiselect.maximum',
    defaultMessage: 'Maximum',
  },
});
