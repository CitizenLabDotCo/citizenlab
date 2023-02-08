const viewsKeys = {
  all: () => [{ type: 'view' }],
  lists: () => [{ ...viewsKeys.all()[0], entity: 'list' }],
  details: () => [{ ...viewsKeys.all()[0], entity: 'detail' }],
  detail: (id: string) => [
    {
      ...viewsKeys.details()[0],
      id,
    },
  ],
} as const;

export default viewsKeys;
