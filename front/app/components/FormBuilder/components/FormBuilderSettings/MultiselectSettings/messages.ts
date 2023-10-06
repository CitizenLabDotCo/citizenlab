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
  otherOptionToggle: {
    id: 'app.components.formBuilder.multiselect.otherOptionToggle',
    defaultMessage: '"Other" option',
  },
  otherOptionTooltip: {
    id: 'app.components.formBuilder.multiselect.otherOptionTooltip',
    defaultMessage:
      'When turned on, respondents can add their own answer to the question when selecting the "other" option.',
  },
});
