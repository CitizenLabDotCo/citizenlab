const categoriesKeys = {
  all: () => [{ type: 'category' }] as const,
  lists: () => [{ ...categoriesKeys.all()[0], operation: 'list' }] as const,
  list: (viewId: string) =>
    [{ ...categoriesKeys.all()[0], operation: 'list', viewId }] as const,
  items: () => [{ ...categoriesKeys.all()[0], operation: 'item' }] as const,
  item: (viewId: string, id: string) =>
    [
      {
        ...categoriesKeys.items()[0],
        viewId,
        id,
      },
    ] as const,
};

export default categoriesKeys;
