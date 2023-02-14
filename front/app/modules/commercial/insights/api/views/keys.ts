const viewsKeys = {
  all: () => [{ type: 'view' }],
  lists: () => [{ ...viewsKeys.all()[0], operation: 'list' }],
  items: () => [{ ...viewsKeys.all()[0], operation: 'item' }],
  item: (id: string) => [
    {
      ...viewsKeys.items()[0],
      id,
    },
  ],
} as const;

export default viewsKeys;
