const categoriesKeys = {
  all: () => [{ type: 'category' }] as const,
  lists: () => [{ ...categoriesKeys.all()[0], entity: 'list' }] as const,
  list: (viewId: string) =>
    [{ ...categoriesKeys.all()[0], entity: 'list', viewId }] as const,
  details: () => [{ ...categoriesKeys.all()[0], entity: 'detail' }] as const,
  detail: (viewId: string, id: string) =>
    [
      {
        ...categoriesKeys.details()[0],
        viewId,
        id,
      },
    ] as const,
};

export default categoriesKeys;
