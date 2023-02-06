const categoryKeys = {
  all: () => [{ type: 'category' }] as const,
  lists: () => [{ ...categoryKeys.all()[0], entity: 'list' }] as const,
  list: (viewId: string) =>
    [{ ...categoryKeys.all()[0], entity: 'list', viewId }] as const,
  details: () => [{ ...categoryKeys.all()[0], entity: 'detail' }] as const,
  detail: (viewId: string, id: string) =>
    [
      {
        ...categoryKeys.details()[0],
        viewId,
        id,
      },
    ] as const,
};

export default categoryKeys;
