import { QueryParameters } from './types';

const eventsKeys = {
  all: () => [{ type: 'events' }],
  lists: () => [{ ...eventsKeys.all()[0], operation: 'list' }],
  list: (projectId: string, filters?: QueryParameters) => [
    { ...eventsKeys.all()[0], entity: 'list', projectId, ...filters },
  ],
  items: () => [{ ...eventsKeys.all()[0], operation: 'item' }],
  item: (eventId: string) => [
    {
      ...eventsKeys.items()[0],
      eventId,
    },
  ],
} as const;

export default eventsKeys;
