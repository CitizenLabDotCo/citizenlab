const ideaStatusesKeys = {
  all: () => [{ type: 'idea_status' }],
  lists: () => [{ ...ideaStatusesKeys.all()[0], operation: 'list' }],
  items: (viewId: string) => [
    { ...ideaStatusesKeys.all()[0], viewId, operation: 'item' },
  ],
  item: (viewId: string, id: string) => [
    {
      ...ideaStatusesKeys.items(viewId)[0],
      id,
    },
  ],
} as const;

export default ideaStatusesKeys;
