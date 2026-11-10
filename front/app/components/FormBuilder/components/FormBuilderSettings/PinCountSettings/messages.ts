import { defineMessages } from 'react-intl';

export default defineMessages({
  limitNumberPins: {
    id: 'app.components.formBuilder.limitNumberPins',
    defaultMessage: 'Limit number of locations',
  },
  limitNumberPinsTooltip: {
    id: 'app.components.formBuilder.limitNumberPinsTooltip',
    defaultMessage:
      'When turned on, respondents need to add the specified number of locations to proceed.',
  },
  minimum: {
    id: 'app.components.formBuilder.pinCount.minimum',
    defaultMessage: 'Minimum',
  },
  maximum: {
    id: 'app.components.formBuilder.pinCount.maximum',
    defaultMessage: 'Maximum',
  },
});
