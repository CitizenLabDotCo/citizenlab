import { InputParameters } from './types';

const eventsKeys = {
  all: () => [{ type: 'events' }],
  lists: () => [{ ...eventsKeys.all()[0], operation: 'list' }],
  list: (filters: InputParameters) => [
    { ...eventsKeys.lists()[0], ...filters },
  ],
  items: () => [{ ...eventsKeys.all()[0], operation: 'item' }],
  item: (eventId?: string) => [
    {
      ...eventsKeys.items()[0],
      eventId,
    },
  ],
} as const;

export default eventsKeys;
