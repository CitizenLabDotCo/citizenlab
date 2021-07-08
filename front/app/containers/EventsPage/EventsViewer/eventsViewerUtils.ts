import { IEventData } from 'services/events';

export function sliceEventsToPage(
  events: IEventData[],
  currentPage: number,
  eventsPerPage: number
) {
  const numberOfEvents = events.length;

  if (numberOfEvents === 0) return [];
  if (numberOfEvents <= 10) return events;

  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;

  return events.slice(startIndex, endIndex);
}

export function getNumberOfPages(
  numberOfEvents: number,
  eventsPerPage: number
) {
  return Math.ceil(numberOfEvents / eventsPerPage);
}
