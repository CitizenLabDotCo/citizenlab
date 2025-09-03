import { defineMessages } from 'react-intl';

export default defineMessages({
  xWeeksLeft: {
    id: 'app.components.phaseTimeLeft.xWeeksLeft',
    defaultMessage: '{timeLeft}  weeks left',
  },
  xDayLeft: {
    id: 'app.components.phaseTimeLeft.xDayLeft',
    defaultMessage:
      '{timeLeft, plural, =0 {Less than a day} one {# day} other {# days}} left',
  },
});
