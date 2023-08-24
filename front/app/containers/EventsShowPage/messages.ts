import { defineMessages } from 'react-intl';

export default defineMessages({
  eventFrom: {
    id: 'app.containers.EventsShow.eventFrom',
    defaultMessage: 'Event from "{eventTitle}"',
  },
  goToProject: {
    id: 'app.containers.EventsShow.goToProject',
    defaultMessage: 'Go to the project',
  },
  xParticipants: {
    id: 'app.containers.EventsShow.xParticipants',
    defaultMessage:
      '{count, plural, one {# participant} other {# participants}}',
  },
  addToCalendar: {
    id: 'app.containers.EventsShow.addToCalendar',
    defaultMessage: 'Add to calendar',
  },
  icsError: {
    id: 'app.containers.EventsShow.icsError',
    defaultMessage: 'Error downloading the ICS file',
  },
});
