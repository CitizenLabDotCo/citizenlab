const eventsKeys = {
  all: () => [{ type: 'events' }],
  lists: () => [{ ...eventsKeys.all()[0], operation: 'list' }],
  // TODO: List using project ids + query params (for useEvents)
  items: () => [{ ...eventsKeys.all()[0], operation: 'item' }],
  item: (eventId: string) => [
    {
      ...eventsKeys.items()[0],
      eventId,
    },
  ],
} as const;

export default eventsKeys;
