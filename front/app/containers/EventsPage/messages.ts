import { defineMessages } from 'react-intl';

export default defineMessages({
  eventsPageTitle1: {
    id: 'app.containers.eventspage.eventsPageTitle1',
    defaultMessage: 'Events | {orgName}',
  },
  eventsPageDescription: {
    id: 'app.containers.eventspage.eventsPageDescription',
    defaultMessage:
      'Show all events posted on the participation platform of {orgName}.',
  },
  upcomingAndOngoingEvents: {
    id: 'app.containers.eventspage.upcomingAndOngoingEvents',
    defaultMessage: 'Upcoming and ongoing events',
  },
  pastEvents: {
    id: 'app.containers.eventspage.pastEvents',
    defaultMessage: 'Past events',
  },
  noUpcomingOrOngoingEvents: {
    id: 'app.containers.eventspage.noUpcomingOrOngoingEvents',
    defaultMessage: 'No upcoming or ongoing events are currently scheduled.',
  },
  noPastEvents: {
    id: 'app.containers.eventspage.noPastEvents',
    defaultMessage: 'No past events to display',
  },
  filterDropdownTitle: {
    id: 'app.containers.eventspage.filterDropdownTitle',
    defaultMessage: 'Projects',
  },
  errorWhenFetchingEvents: {
    id: 'app.containers.eventspage.errorWhenFetchingEvents',
    defaultMessage:
      'An error occurred while loading events. Please try reloading the page.',
  },
  events: {
    id: 'app.containers.eventspage.events',
    defaultMessage: 'Events',
  },
  a11y_eventsHaveChanged1: {
    id: 'app.containers.SearchInput.a11y_eventsHaveChanged1',
    defaultMessage:
      '{numberOfEvents, plural, =0 {# events have loaded} one {# event has loaded} other {# events have loaded}}.',
  },
});
