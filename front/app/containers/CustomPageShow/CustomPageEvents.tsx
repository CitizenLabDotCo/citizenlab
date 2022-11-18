import React from 'react';
import useEvents from 'hooks/useEvents';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';

interface Props {
  projectIds: string[] | null;
}

const CustomPageEvents = ({ projectIds }: Props) => {
  const { events } = useEvents({
    projectPublicationStatuses: ['published'],
    currentAndFutureOnly: true,
    pageSize: 3,
    sort: 'oldest',
    ...(projectIds && { projectIds }),
  });

  // We only want to render the events component when projectIds is not null and has at least 1 project.
  // This prevents the component from flashing while we wait for projectIds.
  //
  // If it's null, the projectIds parameter doesn't get added, which
  // means it's undefined and we fetch *all* events.
  //
  // If a custom page gets created with a tag or area that has no projects,
  // projectIds is [] (via adminPublications.list mapping CustomPageShow).
  // That's the same as projectIds = undefined, which means *all* events.
  //
  // Just adding this length check to useEvents where we add projectIds wouldn't work.
  // The component would still render with all events (if we don't specify the projectsIds parameter.)
  if (projectIds && projectIds.length > 0) {
    return <EventsWidget events={events} />;
  }

  return null;
};

export default CustomPageEvents;
