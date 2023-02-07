const viewKeys = {
  all: () => [{ type: 'view' }],
  lists: () => [{ ...viewKeys.all()[0], entity: 'list' }],
  details: () => [{ ...viewKeys.all()[0], entity: 'detail' }],
  detail: (id: string) => [
    {
      ...viewKeys.details()[0],
      id,
    },
  ],
} as const;

export default viewKeys;
