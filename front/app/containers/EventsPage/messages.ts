import { defineMessages } from 'react-intl';

export default defineMessages({
  eventsPageTitle: {
    id: 'app.containers.eventspage.eventsPageTitle',
    defaultMessage: 'Events',
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
  upcomingEventsWidgetTitle: {
    id: 'app.containers.landing.upcomingEventsWidgetTitle',
    defaultMessage: 'Upcoming and ongoing events',
  },
  viewAllEventsText: {
    id: 'app.containers.landing.viewAllEventsText',
    defaultMessage: 'View all events',
  },
});
