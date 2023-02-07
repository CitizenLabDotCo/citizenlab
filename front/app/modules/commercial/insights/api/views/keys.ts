const viewKeys = {
  all: () => [{ type: 'view' }] as const,
  lists: () => [{ ...viewKeys.all()[0], entity: 'list' }] as const,
  details: () => [{ ...viewKeys.all()[0], entity: 'detail' }] as const,
  detail: (id: string) =>
    [
      {
        ...viewKeys.details()[0],
        id,
      },
    ] as const,
};

export default viewKeys;
