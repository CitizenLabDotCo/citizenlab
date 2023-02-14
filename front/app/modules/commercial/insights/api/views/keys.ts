const viewsKeys = {
  all: () => [{ type: 'view' }],
  lists: () => [{ ...viewsKeys.all()[0], operation: 'list' }],
  details: () => [{ ...viewsKeys.all()[0], operation: 'item' }],
  detail: (id: string) => [
    {
      ...viewsKeys.details()[0],
      id,
    },
  ],
} as const;

export default viewsKeys;
