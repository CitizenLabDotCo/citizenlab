import { defineMessages } from 'react-intl';

export default defineMessages({
  startsAt: {
    id: 'app.components.EventCard.startsAt',
    defaultMessage: 'Starts at',
  },
  endsAt: {
    id: 'app.components.EventCard.endsAt',
    defaultMessage: 'Ends at',
  },
  showMore: {
    id: 'app.components.EventCard.showMore',
    defaultMessage: 'Show more',
  },
  showLess: {
    id: 'app.components.EventCard.showLess',
    defaultMessage: 'Show less',
  },
  a11y_moreContentVisible: {
    id: 'app.components.EventCard.a11y_moreContentVisible',
    defaultMessage: 'More event information became visble.',
  },
  a11y_lessContentVisible: {
    id: 'app.components.EventCard.a11y_lessContentVisible',
    defaultMessage: 'Less event information became visble.',
  },
  readMore: {
    id: 'app.components.EventCard.readMore',
    defaultMessage: 'Read more',
  },
  a11y_readMore: {
    id: 'app.components.EventCard.a11y_readMore',
    defaultMessage: 'Read more about the "{eventTitle}" event.',
  },
  online: {
    id: 'app.containers.EventsShow.online2',
    defaultMessage: 'Online meeting',
  },
  eventDateTimeIcon: {
    id: 'app.containers.EventsShow.eventDateTimeIcon',
    defaultMessage: 'Event date and time',
  },
  locationIconAltText: {
    id: 'app.containers.EventsShow.locationIconAltText',
    defaultMessage: 'Location',
  },
  onlineLinkIconAltText: {
    id: 'app.containers.EventsShow.onlineLinkIconAltText',
    defaultMessage: 'Online meeting link',
  },
  registrantsIconAltText: {
    id: 'app.containers.EventsShow.registrantsIconAltText',
    defaultMessage: 'Registrants',
  },
  registrantCountWithMaximum: {
    id: 'app.containers.EventsShow.registrantCountWithMaximum',
    defaultMessage: '{attendeesCount} / {maximumNumberOfAttendees} registrants',
  },
  registrantCount: {
    id: 'app.containers.EventsShow.registrantCount',
    defaultMessage:
      '{attendeesCount, plural, =0 {0 registrants} one {1 registrant} other {# registrants}}',
  },
});
