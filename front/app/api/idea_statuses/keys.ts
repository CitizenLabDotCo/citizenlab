const ideaStatusesKeys = {
  all: () => [{ type: 'idea_status' }],
  lists: () => [{ ...ideaStatusesKeys.all()[0], operation: 'list' }],
  items: () => [{ ...ideaStatusesKeys.all()[0], operation: 'item' }],
  item: (id: string) => [
    {
      ...ideaStatusesKeys.items()[0],
      id,
    },
  ],
} as const;

export default ideaStatusesKeys;
