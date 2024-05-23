import { defineMessages } from 'react-intl';

export default defineMessages({
  singleDayScreenReaderDate: {
    id: 'app.containers.EventsShow.singleDayScreenReaderDate',
    defaultMessage: 'Event date: {eventDate} from {startTime} to {endTime}',
  },
  multiDayScreenReaderDate: {
    id: 'app.containers.EventsShow.multiDayScreenReaderDate',
    defaultMessage:
      'Event date: {startDate} at {startTime} to {endDate} at {endTime}',
  },
});
