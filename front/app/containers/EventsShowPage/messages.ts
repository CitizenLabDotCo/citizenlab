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
  linkToOnlineEvent: {
    id: 'app.containers.EventsShow.linkToOnlineEvent',
    defaultMessage: 'Link to online event',
  },
  goBack: {
    id: 'app.containers.EventsShow.goBack',
    defaultMessage: 'Go back',
  },
});
