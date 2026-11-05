import { defineMessages } from 'react-intl';

export default defineMessages({
  singleDayScreenReaderDate: {
    id: 'app.components.ScreenReadableEventDate..singleDayScreenReaderDate',
    defaultMessage:
      'Event date: {eventDate} from {startTime} to {endTime} {timezone}.',
  },
  multiDayScreenReaderDate: {
    id: 'app.components.ScreenReadableEventDate..multiDayScreenReaderDate',
    defaultMessage:
      'Event date: {startDate} at {startTime} to {endDate} at {endTime} {timezone}.',
  },
});
