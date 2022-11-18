import React from 'react';
import useEvents from 'hooks/useEvents';
import EventsWidget from 'components/LandingPages/citizen/EventsWidget';

interface Props {
  projectIds: string[];
}

const CustomPageEvents = ({ projectIds }: Props) => {
  const { events } = useEvents({
    projectPublicationStatuses: ['published'],
    currentAndFutureOnly: true,
    pageSize: 3,
    sort: 'oldest',
    projectIds,
  });

  if (projectIds.length > 0) {
    return <EventsWidget events={events} />;
  }

  return null;
};

export default CustomPageEvents;
