const eventFilesKeys = {
  all: () => [{ type: 'file' }],
  lists: () => [{ ...eventFilesKeys.all()[0], operation: 'list' }],
  list: (eventId?: string) => [
    { ...eventFilesKeys.all()[0], entity: 'list', eventId },
  ],
  items: () => [{ ...eventFilesKeys.all()[0], operation: 'item' }],
  item: (eventId?: string) => [
    {
      ...eventFilesKeys.items()[0],
      eventId,
    },
  ],
} as const;

export default eventFilesKeys;
