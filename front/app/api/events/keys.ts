const eventsKeys = {
  all: () => [{ type: 'events' }],
  lists: () => [{ ...eventsKeys.all()[0], operation: 'list' }],
  items: () => [{ ...eventsKeys.all()[0], operation: 'item' }],
  item: (id: string) => [
    {
      ...eventsKeys.items()[0],
      id,
    },
  ],
} as const;

export default eventsKeys;
